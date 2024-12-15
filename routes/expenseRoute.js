import express from "express";
import {
  addExpense,
  deleteExpense,
  getExpense,
  searchExpense,
  updateExpense,
} from "../controllers/expenseController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authMiddleware, addExpense);

router.get("/get", authMiddleware, getExpense);

router.put("/update/:eid", updateExpense);

router.delete("/delete/:eid", deleteExpense);

router.get("/search", authMiddleware, searchExpense);

export default router;
