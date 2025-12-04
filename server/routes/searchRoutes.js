import express from "express";
import { search } from "../controllers/searchController.js";

const router = express.Router();

// Search for users and communities
router.get("/", search);

export default router;
