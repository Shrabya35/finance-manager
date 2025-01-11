import express from "express";
import {
  getUserProfile,
  goalContribution,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get", authMiddleware, getUserProfile);

router.patch("/contribute-goal", authMiddleware, goalContribution);

export default router;
