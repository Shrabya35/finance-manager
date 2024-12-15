import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  addJob,
  getJob,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";

const router = express.Router();

router.post("/add", authMiddleware, addJob);

router.get("/get", authMiddleware, getJob);

router.put("/update/:jid", updateJob);

router.delete("/delete/:jid", deleteJob);

export default router;
