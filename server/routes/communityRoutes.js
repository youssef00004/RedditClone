import express from "express";
import {
  createCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityDetails,
  getAllCommunities,
} from "../controllers/communityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes - anyone can view communities
router.get("/", getAllCommunities);
router.get("/:id", getCommunityDetails);

// Protected routes - require authentication
router.post("/", protect, createCommunity);
router.post("/:id/join", protect, joinCommunity);
router.post("/:id/leave", protect, leaveCommunity);

export default router;
