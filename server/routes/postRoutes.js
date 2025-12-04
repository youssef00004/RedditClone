import express from "express";
import {
  createPost,
  getCommunityPosts,
  getFeedPosts,
  getPostById,
  deletePost,
} from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";
import { votePost } from "../controllers/voteController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/", protect, upload.single("image"), createPost);
router.get("/community/:communityId", protect, getCommunityPosts);
router.get("/feed", protect, getFeedPosts);
router.get("/:id", protect, getPostById);
router.post("/:id/vote", protect, votePost);
router.delete("/:id", protect, deletePost);

export default router;
