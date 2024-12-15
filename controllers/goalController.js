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

    const userExpenses = await expenseModel.find({
      user: userId,
      isRecurring: true,
    });

    const totalExpenses = userExpenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );

    const userJobs = await jobModel.find({ user: userId });
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
    const goal = await expenseModel
      .find({ user: userId })
      .sort({ startDate: -1 });
    res.status(201).json({
      success: true,
      message: "Goals retrieved successfully",
      goal,
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

export const searchGoal = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    const userId = req.user._id;
    const goal = await goalModel.find({
      user: userId,
      name,
    });
    res.status(201).json({
      success: true,
      message: "Goal searched successfull",
      goal,
    });
  } catch (error) {
    console.error("Error searching goal:", error);
    res.status(500).send({
      success: false,
      message: "Error searching goal",
      error: error.message,
    });
  }
};
