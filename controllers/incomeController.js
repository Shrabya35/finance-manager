import mongoose from "mongoose";
import incomeModel from "../models/incomeModel.js";
import userModel from "../models/userModel.js";

export const addIncome = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, name, description } = req.body;
    if (!amount || !name || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const userId = req.user._id;
    console.log(userId);
    const Income = await new incomeModel({
      user: userId,
      amount,
      name,
      description,
    }).save({ session });

    const user = await userModel.findById(userId).session(session);
    if (!user) {
      throw new Error("User not found");
    }

    user.pocket += parseFloat(amount);
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Income added Successfully",
      Income,
    });
  } catch (error) {
    console.error("Error adding income:", error);
    res.status(500).json({
      success: false,
      message: "Error adding income",
      error: error.message,
    });
  }
};

export const getIncome = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const income = await incomeModel
      .find({ user: userId })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalIncomes = await incomeModel.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      message: "Incomes retrieved successfully",
      income,
      totalIncomes,
      currentPage: page,
      totalPages: Math.ceil(totalIncomes / limit),
    });
  } catch (error) {
    console.error("Error getting income:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving income",
      error: error.message,
    });
  }
};

export const updateIncome = async (req, res) => {
  try {
    const { amount, name, description } = req.body;

    if (!amount || !name || description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const updateIncome = {
      amount,
      name,
      description,
    };

    const income = await incomeModel.findByIdAndUpdate(
      req.params.iid,
      updateIncome,
      {
        new: true,
      }
    );

    if (!income) {
      return res.status(404).json({ message: "Expense not found." });
    }

    res.status(200).json({
      success: true,
      message: "Income updated successfully",
      income,
    });
  } catch (error) {
    console.error("Error updating income:", error);
    res.status(500).json({
      success: false,
      message: "Error updating income",
      error: error.message,
    });
  }
};

export const deleteIncome = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const income = await incomeModel.findById(req.params.iid).session(session);

    if (!income) {
      return res.status(404).json({ message: "Income not found." });
    }

    const userId = req.user._id;
    const user = await userModel.findById(userId).session(session);
    if (!user) {
      throw new Error("User not found");
    }

    user.pocket -= parseFloat(income.amount);
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Income deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting income:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting income",
      error: error.message,
    });
  }
};

export const searchIncome = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }
    const userId = req.user._id;
    const income = await incomeModel.find({
      user: userId,
      name,
    });
    res.status(201).json({
      success: true,
      message: "Income searched successfull",
      income,
    });
  } catch (error) {
    console.error("Error searching income:", error);
    res.status(500).json({
      success: false,
      message: "Error searching income",
      error: error.message,
    });
  }
};
