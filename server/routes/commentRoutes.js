import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createComment,
  getCommentsByPost,
  deleteComment,
} from "../controllers/commentController.js";
import { voteComment } from "../controllers/commentVoteController.js";

const router = express.Router();

// Create a new comment or reply
router.post("/:postId", protect, createComment);

// Get all comments for a post
router.get("/:postId", getCommentsByPost);

// Vote on a comment
router.post("/:commentId/vote", protect, voteComment);

// Delete a comment
router.delete("/:commentId", protect, deleteComment);

export default router;
