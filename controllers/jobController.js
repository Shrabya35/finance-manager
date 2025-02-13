import jobModel from "../models/jobModel.js";
import goalModel from "../models/goalModel.js";

export const addJob = async (req, res) => {
  try {
    const { name, salary, organization } = req.body;
    const userId = req.user._id;

    if (!name || !salary || !organization) {
      return res.status(400).send({ error: "All fields are required" });
    }
    const existingJob = await jobModel.findOne({ user: userId });
    if (existingJob) {
      return res.status(400).json({ message: "User already has a job." });
    }

    const newJob = new jobModel({
      user: userId,
      name,
      salary,
      organization,
    });

    await newJob.save();
    res.status(201).json({
      success: true,
      message: "Job added successfully",
      newJob,
    });
  } catch (error) {
    console.error("Error adding job:", error);
    res.status(500).json({
      success: false,
      message: "Error adding job",
      error: error.message,
    });
  }
};

export const getJob = async (req, res) => {
  try {
    const userId = req.user._id;
    const job = await jobModel.findOne({ user: userId });

    if (!job) {
      return res.status(404).json({ message: "Job not found for this user." });
    }

    res.status(200).json({
      success: true,
      message: "Job retrieved successfully",
      job,
    });
  } catch (error) {
    console.error("Error retrieving job:", error);
    res.status(500).send({
      success: false,
      message: "Error in getting job",
      error: error.message,
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { name, salary, organization } = req.body;

    if (!name && !salary && !organization) {
      return res
        .status(400)
        .send({ error: "At least one field is required to update" });
    }

    const oldJob = await jobModel.findById(req.params.jid);
    if (!oldJob) {
      return res.status(404).json({ message: "Job not found." });
    }

    const goal = await goalModel.findOne({
      user: oldJob._id,
      isAchieved: false,
      expire: false,
    });

    if (goal && salary && goal.monthlyContribution > salary) {
      return res.status(400).json({
        message:
          "You need to decrease the monthly contribution on your goal to continue.",
      });
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (salary) updateFields.salary = salary;
    if (organization) updateFields.organization = organization;

    const updatedJob = await jobModel.findByIdAndUpdate(
      req.params.jid,
      { $set: updateFields },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).send({
      success: false,
      message: "Error updating job",
      error: error.message,
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await jobModel.findByIdAndDelete(req.params.jid);

    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    res.status(200).send({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).send({
      success: false,
      message: "Error deleting job",
      error: error.message,
    });
  }
};
