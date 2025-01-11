import userModel from "../models/userModel.js";
import jobModel from "../models/jobModel.js";
import expenseModel from "../models/expenseModel.js";
import incomeModel from "../models/incomeModel.js";
import goalModel from "../models/goalModel.js";

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
      { $match: { user: userId, isRecurring: true } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);

    const totalAmount =
      totalExpense.length > 0 ? totalExpense[0].totalAmount : 0;

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
      message: "User profile fetched successfully",
      user: await userModel.findById(userId),
      totalExpense: totalAmount,
      job: job,
      currentGoal: currentGoal,
      goals: goals,
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

export const goalContribution = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;

    const goal = await goalModel.findOne({
      user: userId,
      isAchieved: false,
      expired: false,
    });

    if (!goal) {
      return res
        .status(404)
        .json({ message: "No active goal found for this user." });
    }

    const requiredAmount = goal.targetAmount - goal.savedAmount;

    if (amount > requiredAmount) {
      return res
        .status(400)
        .json({ message: "Amount exceeds the goal's required amount." });
    }

    goal.savedAmount += amount;

    if (goal.savedAmount >= goal.targetAmount) {
      goal.isAchieved = true;
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: "Contribution added to the goal successfully.",
      goal,
    });
  } catch (error) {
    console.error("Error contributing to goal:", error);
    res.status(500).json({
      success: false,
      message: "Error contributing to goal.",
      error: error.message,
    });
  }
};
