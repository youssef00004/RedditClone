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

// Public routes - anyone can view user profiles
router.get("/username/:username", getUserByUsername);
router.get("/:id/posts", getUserPosts);
router.get("/:id/comments", getUserComments);
router.get("/:id", getUserProfile);

// Protected routes - require authentication
// Private user data
router.get("/:id/upvoted/posts", protect, getUserUpvotedPosts);
router.get("/:id/downvoted/posts", protect, getUserDownvotedPosts);
router.get("/:id/upvoted/comments", protect, getUserUpvotedComments);
router.get("/:id/downvoted/comments", protect, getUserDownvotedComments);
router.get("/:id/saved", protect, getUserSavedPosts);

// User actions
router.post("/save", protect, savePost);
router.post("/unsave", protect, unsavePost);
router.post("/:id/follow", protect, followUser);
router.post("/:id/unfollow", protect, unfollowUser);
router.put("/:id", protect, updateUserProfile);

export default router;
