import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  addGoal,
  deleteGoal,
  getGoal,
  goalContribution,
} from "../controllers/goalController.js";

const router = express.Router();

router.post("/add", authMiddleware, addGoal);

router.get("/get", authMiddleware, getGoal);

router.delete("/delete/:gid", deleteGoal);

router.patch("/contribute", authMiddleware, goalContribution);

export default router;
