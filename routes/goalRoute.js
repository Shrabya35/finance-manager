import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { addGoal, deleteGoal, getGoal } from "../controllers/goalController.js";

const router = express.Router();

router.post("/add", authMiddleware, addGoal);

router.get("/get", authMiddleware, getGoal);

router.delete("/delete/:gid", deleteGoal);

export default router;
