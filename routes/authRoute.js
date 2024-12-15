import express from "express";
import {
  googleSignIn,
  loginController,
  registerController,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/google-signin", googleSignIn);
export default router;
