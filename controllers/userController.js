import userModel from "../models/userModel.js";
import jobModel from "../models/jobModel.js";
import expenseModel from "../models/expenseModel.js";
import incomeModel from "../models/incomeModel.js";
import goalModel from "../models/goalModel.js";

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const incomes = await incomeModel.find({ user: userId }).sort({ date: -1 });
    const expenses = await expenseModel
      .find({ user: userId })
      .sort({ date: -1 });
    const job = await jobModel.findOne({ user: userId });
    const currentGoal = await goalModel.findOne({
      user: userId,
      isAchieved: false,
    });
    const goals = await goalModel.find({
      user: userId,
      isAchieved: true,
    });
    return res.status(200).json({
      success: true,
      message: "User profiled fetched successfully",
      user,
      incomes: incomes,
      expenses: expenses,
      job: job,
      currentGoal: currentGoal,
      goals: goals,
    });
  } catch (error) {
    console.error("Error fetching userProfile:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching userProfile",
      error: error.message,
    });
  }
};
