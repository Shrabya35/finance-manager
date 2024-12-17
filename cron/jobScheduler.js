import cron from "node-cron";
import mongoose from "mongoose";
import goalModel from "../models/goalModel.js";
import jobModel from "../models/jobModel.js";
import userModel from "../models/userModel.js";

export const jobScheduler = () => {
  cron.schedule("0 0 1 * *", async () => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const jobs = await jobModel.find({});
      if (!jobs) {
        return res.status(400).json({
          message: "job not found",
        });
      }
      for (const job of jobs) {
        const user = await userModel.findById(job.user).session(session);
        const goal = await goalModel
          .findOne({ user: user._id })
          .session(session);
        if (user) {
          if (goal) {
            const netSaving = job.salary - goal.monthlyContribution;
            user.pocket += netSaving;
            goal.savedAmount += goal.monthlyContribution;
          } else {
            user.pocket += job.salary;
          }
          await user.save({ session });
          await goal.save({ session });
        }
      }
    } catch (error) {
      await session.abortTransaction();
      console.error("Error running monthly job salary addons:", error);
    } finally {
      session.endSession();
    }
  });
};
