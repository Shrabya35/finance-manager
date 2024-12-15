import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  addIncome,
  deleteIncome,
  getIncome,
  searchIncome,
  updateIncome,
} from "../controllers/incomeController.js";

const router = express.Router();

router.post("/add", authMiddleware, addIncome);

router.get("/get", authMiddleware, getIncome);

router.put("/update/:iid", updateIncome);

router.delete("/delete/:iid", authMiddleware, deleteIncome);

router.get("/search", authMiddleware, searchIncome);

export default router;
