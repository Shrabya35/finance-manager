import goalModel from "../models/goalModel.js";
import expenseModel from "../models/expenseModel.js";
import jobModel from "../models/jobModel.js";

export const addGoal = async (req, res) => {
  try {
    const { name, description, targetAmount, monthlyContribution, deadline } =
      req.body;
    if (
      !name ||
      !description ||
      !targetAmount ||
      !monthlyContribution ||
      !deadline
    ) {
      return res.status(400).json({ message: "all fields are required" });
    }
    const deadlineDate = new Date(deadline);
    const currentDate = new Date();

    if (
      deadlineDate.getFullYear() === currentDate.getFullYear() &&
      deadlineDate.getMonth() === currentDate.getMonth()
    ) {
      return res
        .status(400)
        .json({ message: "Goal cannot be created for this month" });
    }

    const userId = req.user._id;

    const existingGoal = await goalModel.findOne({
      user: userId,
      isAchieved: false,
      expired: false,
    });
    if (existingGoal) {
      return res.status(400).json({
        message: "You can't have 2 ongoing goals at the same time",
      });
    }
    if (monthlyContribution <= 0) {
      return res
        .status(400)
        .json({ message: "Monthly Contribution must be greater than zero" });
    }

    const [userExpenses, userJobs] = await Promise.all([
      expenseModel.find({ user: userId, isRecurring: true }),
      jobModel.find({ user: userId }),
    ]);

    const totalExpenses = userExpenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );

    const totalSalary = userJobs.reduce((total, job) => total + job.salary, 0);

    const savings = totalSalary - totalExpenses;

    if (monthlyContribution > savings) {
      return res.status(400).json({
        message: "Monthly Contribution doesn't fit in your budget",
      });
    }

    const goal = await new goalModel({
      user: userId,
      name,
      description,
      targetAmount,
      monthlyContribution,
      deadline,
    }).save();

    res.status(201).json({
      success: true,
      message: "Goal created successfully",
      goal,
    });
  } catch (error) {
    console.error("Error adding goal:", error);
    res.status(500).json({
      success: false,
      message: "Error adding goal",
      error: error.message,
    });
  }
};

export const getGoal = async (req, res) => {
  try {
    const userId = req.user._id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const currentGoal = await goalModel.findOne({
      user: userId,
      isAchieved: false,
      expired: false,
    });
    const goal = await goalModel
      .find({
        user: userId,
        $or: [{ isAchieved: true }, { expired: true }],
      })
      .sort({ startDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalGoals = await goalModel.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      message: "Goals retrieved successfully",
      goal,
      currentGoal,
      totalGoals,
      currentPage: page,
      totalPages: Math.ceil(totalGoals / limit),
    });
  } catch (error) {
    console.error("Error getting goal:", error);
    res.status(500).json({
      success: false,
      message: "Error getting goal",
      error: error.message,
    });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const goal = await goalModel.findByIdAndDelete(req.params.gid);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found." });
    }

    res.status(200).send({
      success: true,
      message: "Goals deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).send({
      success: false,
      message: "Error deleting goal",
      error: error.message,
    });
  }
};
export const goalContribution = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;
    const numericAmount = Number(amount);

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

    if (numericAmount > requiredAmount) {
      return res
        .status(400)
        .json({ message: "Amount exceeds the goal's required amount." });
    }

    goal.savedAmount += numericAmount;

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
