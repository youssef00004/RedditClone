import express from "express";
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
  searchUsersForChat,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post("/conversation", getOrCreateConversation);
router.get("/conversations", getConversations);
router.get("/messages/:conversationId", getMessages);
router.post("/message", sendMessage);
router.get("/unread", getUnreadCount);
router.get("/search-users", searchUsersForChat);

export default router;
