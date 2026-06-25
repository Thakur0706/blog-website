const express = require("express");
const {
  getChats,
  getOrCreateChat,
  getMessages,
  searchUsers,
  getUnreadCount,
} = require("../controllers/chat.controllers");
const { requireAuth } = require("@clerk/express");

const chatRouter = express.Router();

chatRouter.get("/", requireAuth(), getChats);
chatRouter.post("/", requireAuth(), getOrCreateChat);
chatRouter.get("/unread", requireAuth(), getUnreadCount);
chatRouter.get("/search-users", requireAuth(), searchUsers);
chatRouter.get("/:chatId/messages", requireAuth(), getMessages);

module.exports = { chatRouter };
