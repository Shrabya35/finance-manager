import express from "express";
import { editName, getUserProfile } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get", authMiddleware, getUserProfile);

router.patch("/edit-name", authMiddleware, editName);

export default router;
