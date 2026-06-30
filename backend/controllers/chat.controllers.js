const { chatModel } = require("../models/chatModel");
const { messageModel } = require("../models/messageModel");
const { userModel } = require("../models/userModel");
const { clerkClient } = require("@clerk/express");

// Get all chats for the current user
const getChats = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const chats = await chatModel
      .find({ participants: userId })
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    // Enrich each chat with the other participant's info from DB
    const enriched = await Promise.all(
      chats.map(async (chat) => {
        const otherParticipantId = chat.participants.find((p) => p !== userId);
        let otherUser = null;
        try {
          const dbUser = await userModel.findOne({ clerkId: otherParticipantId });
          if (dbUser) {
            otherUser = {
              clerkId: dbUser.clerkId,
              username: dbUser.username,
              img: dbUser.img || null,
            };
          } else {
            // Fallback: If user is not in our DB (e.g. webhook issue/delay), fetch from Clerk
            const clerkUser = await clerkClient.users.getUser(otherParticipantId);
            if (clerkUser) {
              const username = clerkUser.username || 
                               (clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : null) || 
                               (clerkUser.emailAddresses && clerkUser.emailAddresses[0]?.emailAddress) ||
                               "Unknown";
              otherUser = {
                clerkId: clerkUser.id,
                username: username,
                img: clerkUser.imageUrl || null,
              };
            }
          }
        } catch (e) {
          // ignore
          console.error("Error fetching other participant:", e);
        }
        return {
          _id: chat._id,
          participants: chat.participants,
          otherUser,
          lastMessage: chat.lastMessage,
          unreadCount: chat.unreadCount?.get(userId) || 0,
          updatedAt: chat.updatedAt,
        };
      })
    );

    res.status(200).json(enriched);
  } catch (error) {
    next(error);
  }
};

// Get or create a chat with another user
const getOrCreateChat = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { targetUserId } = req.body;
    if (!targetUserId) return res.status(400).json({ message: "targetUserId required" });

    // Check if chat already exists between these two
    let chat = await chatModel.findOne({
      participants: { $all: [userId, targetUserId] },
    });

    if (!chat) {
      chat = new chatModel({
        participants: [userId, targetUserId],
        unreadCount: { [userId]: 0, [targetUserId]: 0 },
      });
      await chat.save();
    }

    res.status(200).json(chat);
  } catch (error) {
    next(error);
  }
};

// Get messages for a chat
const getMessages = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { chatId } = req.params;
    const chat = await chatModel.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (!chat.participants.includes(userId))
      return res.status(403).json({ message: "Forbidden" });

    const messages = await messageModel.find({ chatId }).sort({ createdAt: 1 });

    // Mark all messages as read by this user
    await messageModel.updateMany(
      { chatId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    // Reset unread count for this user
    await chatModel.findByIdAndUpdate(chatId, {
      $set: { [`unreadCount.${userId}`]: 0 },
    });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

// Search users by username
const searchUsers = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { query } = req.query;
    if (!query) return res.status(200).json([]);

    const users = await userModel
      .find({
        username: { $regex: query, $options: "i" },
        clerkId: { $ne: userId },
      })
      .limit(10)
      .select("clerkId username img");

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// Get total unread message count for the current user
const getUnreadCount = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const chats = await chatModel.find({ participants: userId });
    let total = 0;
    chats.forEach((chat) => {
      total += chat.unreadCount?.get(userId) || 0;
    });

    res.status(200).json({ unreadCount: total });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChats,
  getOrCreateChat,
  getMessages,
  searchUsers,
  getUnreadCount,
};
