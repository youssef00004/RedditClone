// routes/searchRoutes.js
import express from "express";
import {
  search,
  getSearchSuggestions,
} from "../controllers/searchController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes - anyone can search
router.get("/", search);
router.get("/suggestions", getSearchSuggestions);

export default router;
