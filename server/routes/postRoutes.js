import express from "express";
import {
  createPost,
  getCommunityPosts,
  getFeedPosts,
  getAllPosts,
  getFollowingFeed,
  getPostById,
  deletePost,
} from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";
import { votePost } from "../controllers/voteController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public routes - anyone can view posts
router.get("/all", getAllPosts);
router.get("/community/:communityId", getCommunityPosts);

// Protected routes - require authentication
router.post("/", protect, upload.single("image"), createPost);
router.get("/feed", protect, getFeedPosts);
router.get("/following", protect, getFollowingFeed);
router.post("/:id/vote", protect, votePost);
router.delete("/:id", protect, deletePost);

// Generic :id route must come LAST to avoid conflicts
router.get("/:id", getPostById);

export default router;
