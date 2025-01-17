import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import jobModel from "../models/jobModel.js";
import expenseModel from "../models/expenseModel.js";
import incomeModel from "../models/incomeModel.js";
import goalModel from "../models/goalModel.js";

export const editName = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    if (!name) {
      return res.send({ error: "name is required" });
    }

    const user = await userModel.findByIdAndUpdate(
      userId,
      { name: name },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User name updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating user name:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user name",
      error: error.message,
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const incomes = await incomeModel
      .find({ user: userId })
      .sort({ date: -1 })
      .limit(5);

    const expenses = await expenseModel
      .find({ user: userId, isRecurring: false })
      .sort({ date: -1 })
      .limit(5);

    const mergedActivities = [...incomes, ...expenses];
    const sortedActivities = mergedActivities.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    const topRecentActivities = sortedActivities.slice(0, 5);

    const totalExpense = await expenseModel.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          isRecurring: true,
        },
      },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);

    const totalAmount =
      totalExpense.length > 0 ? totalExpense[0].totalAmount : 0;

    const job = await jobModel.findOne({ user: userId });
    const currentGoal = await goalModel.findOne({
      user: userId,
      isAchieved: false,
      expired: false,
    });
    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      user: await userModel.findById(userId),
      totalExpense: totalAmount,
      job: job,
      currentGoal: currentGoal,
      activities: topRecentActivities,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};
