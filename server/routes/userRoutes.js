import express from "express";
import {
  getUserProfile,
  getUserByUsername,
  getUserPosts,
  getUserComments,
  getUserUpvotedPosts,
  getUserDownvotedPosts,
  getUserUpvotedComments,
  getUserDownvotedComments,
  getUserSavedPosts,
  savePost,
  unsavePost,
  followUser,
  unfollowUser,
  updateUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user by username
router.get("/username/:username", protect, getUserByUsername);

// Get user's posts
router.get("/:id/posts", protect, getUserPosts);

// Get user's comments
router.get("/:id/comments", protect, getUserComments);

// Get user's upvoted posts
router.get("/:id/upvoted/posts", protect, getUserUpvotedPosts);

// Get user's downvoted posts
router.get("/:id/downvoted/posts", protect, getUserDownvotedPosts);

// Get user's upvoted comments
router.get("/:id/upvoted/comments", protect, getUserUpvotedComments);

// Get user's downvoted comments
router.get("/:id/downvoted/comments", protect, getUserDownvotedComments);

// Get user's saved posts
router.get("/:id/saved", protect, getUserSavedPosts);

// Save/unsave post
router.post("/save", protect, savePost);
router.post("/unsave", protect, unsavePost);

// Follow/unfollow user
router.post("/:id/follow", protect, followUser);
router.post("/:id/unfollow", protect, unfollowUser);

// Get user profile by ID
router.get("/:id", protect, getUserProfile);

// Update user profile
router.put("/:id", protect, updateUserProfile);

export default router;
