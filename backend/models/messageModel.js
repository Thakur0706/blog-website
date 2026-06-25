const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: String, // clerkId
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    // Optional: attached blog post
    sharedPost: {
      postId: { type: String, default: null },
      title: { type: String, default: null },
      slug: { type: String, default: null },
      img: { type: String, default: null },
      desc: { type: String, default: null },
    },
    readBy: [{ type: String }], // clerkIds of users who read it
  },
  { timestamps: true }
);

const messageModel = mongoose.model("Message", messageSchema);
module.exports = { messageModel };
