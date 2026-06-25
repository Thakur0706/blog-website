const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const { userRouter } = require("./routes/user.route");
const { postRouter } = require("./routes/post.route");
const { commentRouter } = require("./routes/comment.route");
const { chatRouter } = require("./routes/chat.route");
const { connectDb } = require("./lib/connectDb");
const { webhookRouter } = require("./routes/webhook.route");
const cors = require("cors");
const { clerkMiddleware, requireAuth, getAuth } = require("@clerk/express");
const http = require("http");
const { Server } = require("socket.io");
const { chatModel } = require("./models/chatModel");
const { messageModel } = require("./models/messageModel");

const port = process.env.PORT || 3000;

// Create HTTP server & attach socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// Map clerkId -> socketId for online tracking
const onlineUsers = new Map();

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;
  if (userId) {
    onlineUsers.set(userId, socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  }

  // User joins their personal room (for receiving messages)
  socket.on("joinRoom", (clerkId) => {
    socket.join(clerkId);
  });

  // User joins a specific chat room
  socket.on("joinChat", (chatId) => {
    socket.join(`chat:${chatId}`);
  });

  // User leaves a chat room
  socket.on("leaveChat", (chatId) => {
    socket.leave(`chat:${chatId}`);
  });

  // Send a new message
  socket.on("sendMessage", async (data) => {
    try {
      const { chatId, sender, content, sharedPost } = data;

      // Validate chat exists and sender is participant
      const chat = await chatModel.findById(chatId);
      if (!chat || !chat.participants.includes(sender)) return;

      // Create message in DB
      const message = new messageModel({
        chatId,
        sender,
        content: content || "",
        sharedPost: sharedPost || {},
        readBy: [sender],
      });
      await message.save();

      // Update lastMessage and increment unread for the OTHER participant
      const otherParticipants = chat.participants.filter((p) => p !== sender);
      const unreadUpdate = {};
      otherParticipants.forEach((p) => {
        const current = chat.unreadCount?.get(p) || 0;
        unreadUpdate[`unreadCount.${p}`] = current + 1;
      });

      await chatModel.findByIdAndUpdate(chatId, {
        lastMessage: message._id,
        ...unreadUpdate,
        updatedAt: new Date(),
      });

      // Emit message to everyone in the chat room
      io.to(`chat:${chatId}`).emit("newMessage", message);

      // Notify the other participants (for unread badge) even if not in chat room
      otherParticipants.forEach((p) => {
        io.to(p).emit("unreadUpdate", { chatId, senderId: sender });
      });
    } catch (error) {
      console.error("sendMessage error:", error);
    }
  });

  // Typing indicator
  socket.on("typing", ({ chatId, userId: typingUserId, isTyping }) => {
    socket.to(`chat:${chatId}`).emit("typing", { userId: typingUserId, isTyping });
  });

  // Mark messages as read
  socket.on("markRead", async ({ chatId, userId: readerId }) => {
    try {
      await messageModel.updateMany(
        { chatId, readBy: { $ne: readerId } },
        { $addToSet: { readBy: readerId } }
      );
      await chatModel.findByIdAndUpdate(chatId, {
        $set: { [`unreadCount.${readerId}`]: 0 },
      });
      // Notify chat room that messages were read
      io.to(`chat:${chatId}`).emit("messagesRead", { chatId, readerId });
    } catch (error) {
      console.error("markRead error:", error);
    }
  });

  socket.on("disconnect", () => {
    if (userId) {
      onlineUsers.delete(userId);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    }
  });
});

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(clerkMiddleware());
app.use("/webhooks", webhookRouter);
app.use(express.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);
app.use("/chats", chatRouter);

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    message: error.message || "Something went wrong",
  });
});

server.listen(port, () => {
  connectDb();
  console.log(`Server listening on port ${port}`);
});