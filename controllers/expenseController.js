import expenseModel from "../models/expenseModel.js";

export const addExpense = async (req, res) => {
  try {
    const { name, amount, isRecurring, deductionDate } = req.body;
    if (!name || !amount || !deductionDate) {
      return res.status(400).send({ error: "All fields are required" });
    }
    const userId = req.user._id;
    if (isRecurring) {
      const existingRecurringJob = await expenseModel.findOne({
        user: userId,
        name,
      });
      if (existingRecurringJob) {
        return res.status(400).json({
          message: "Recurring job with a similar name already exists.",
        });
      }
    }
    const newExpense = await new expenseModel({
      user: userId,
      name,
      amount,
      isRecurring,
      deductionDate,
    }).save();

    res.status(201).json({
      success: true,
      message: "Expense addedSuccessfully",
      newExpense,
    });
  } catch (error) {
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
    const expense = await expenseModel
      .find({ user: userId })
      .sort({ date: -1 });

    res.status(201).json({
      success: true,
      message: "expenses retrieved successfully",
      expense,
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

    if (!name || !amount || isRecurring || !deductionDate) {
      return res.status(400).send({ error: "ALl field are required " });
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
