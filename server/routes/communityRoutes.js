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

// Create new community
router.post("/", protect, createCommunity);

// Join community
router.post("/:id/join", protect, joinCommunity);

// Leave community
router.post("/:id/leave", protect, leaveCommunity);

// View a single community
router.get("/:id", protect, getCommunityDetails);

// View all communities (for search or browsing)
router.get("/", protect, getAllCommunities);

export default router;
