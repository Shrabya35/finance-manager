import express from "express";
import {
  changePassword,
  googleSignIn,
  loginController,
  registerController,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/google-signin", googleSignIn);

router.patch("/change-password", authMiddleware, changePassword);

export default router;
