import expenseModel from "../models/expenseModel.js";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";

export const addExpense = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, amount, isRecurring, deductionDate } = req.body;
    if (!name || !amount || !deductionDate) {
      return res.status(400).send({ error: "All fields are required" });
    }
    if (isRecurring && isNaN(new Date(deductionDate).getTime())) {
      return res.status(400).send({ error: "Invalid deduction date format" });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return res
        .status(400)
        .send({ error: "Amount must be a positive number" });
    }
    const userId = req.user._id;

    if (!isRecurring) {
      const user = await userModel.findById(userId).session(session);
      if (user.pocket < amount) {
        return res
          .status(400)
          .send({ error: "Insufficient funds in your account" });
      }
      user.pocket -= amount;
      await user.save({ session });
    }

    if (isRecurring) {
      const existingRecurringExpense = await expenseModel
        .findOne({
          user: userId,
          name,
        })
        .session(session);

      if (existingRecurringExpense) {
        return res.status(400).json({
          message: "Recurring Expense with a similar name already exists.",
        });
      }
    }

    const newExpense = new expenseModel({
      user: userId,
      name,
      amount,
      isRecurring,
      deductionDate: isRecurring ? deductionDate : new Date().toISOString(),
    });

    await newExpense.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      newExpense,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error adding expense:", error);
    res.status(500).json({
      success: false,
      message: "Error adding expense",
      error: error.message,
    });
  }
};

export const getExpense = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const expense = await expenseModel
      .find({ user: userId, isRecurring: false })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const monthlyExpense = await expenseModel
      .find({ user: userId, isRecurring: true })
      .sort({ date: -1 });

    const totalExpense = await expenseModel.countDocuments({
      user: userId,
      isRecurring: false,
    });

    res.status(201).json({
      success: true,
      message: "expenses retrieved successfully",
      expense,
      monthlyExpense,
      totalExpense,
      currentPage: page,
      totalPages: Math.ceil(totalExpense / limit),
    });
  } catch (error) {
    console.error("Error getting expense:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving expense",
      error: error.message,
    });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { name, amount, isRecurring, deductionDate } = req.body;

    if (!name || !amount || !deductionDate) {
      return res.status(400).send({ error: "ALl field are required " });
    }

    if (!isRecurring) {
      return res
        .status(400)
        .send({ error: "non recurring expense cant be edited " });
    }
    const updateExpense = {
      name,
      amount,
      isRecurring,
      deductionDate,
    };

    const expense = await expenseModel.findByIdAndUpdate(
      req.params.eid,
      updateExpense,
      {
        new: true,
      }
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).send({
      success: false,
      message: "Error updating expense",
      error: error.message,
    });
  }
};
export const deleteExpense = async (req, res) => {
  try {
    const expense = await expenseModel.findByIdAndDelete(req.params.eid);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    res.status(200).send({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).send({
      success: false,
      message: "Error deleting expense",
      error: error.message,
    });
  }
};

export const searchExpense = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    const userId = req.user._id;
    const expense = await expenseModel.find({
      user: userId,
      name,
    });
    res.status(201).json({
      success: true,
      message: "Expense search successfull",
      expense,
    });
  } catch (error) {
    console.error("Error searching expense:", error);
    res.status(500).send({
      success: false,
      message: "Error searching expense",
      error: error.message,
    });
  }
};
