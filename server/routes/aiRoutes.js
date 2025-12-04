import express from "express";
import { summarizePost } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Summarize post content
router.get("/summarize/:id", protect, summarizePost);

export default router;
