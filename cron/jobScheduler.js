import cron from "node-cron";
import mongoose from "mongoose";
import goalModel from "../models/goalModel.js";
import jobModel from "../models/jobModel.js";

export const jobScheduler = () => {
  //0:min, 0:hour, 1:1st day of month, *every month, *every day of week(ignored anyway)
  cron.schedule("0 0 1 * *", async () => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const jobs = await jobModel.find({}).populate("user").session(session);

      for (const job of jobs) {
        const user = job.user;
        if (!user) {
          console.warn(`Job ${job._id} has no associated user. Skipping.`);
          continue;
        }

        const goal = await goalModel
          .findOne({ user: user._id, expired: false })
          .session(session);

        if (goal) {
          const remainingAmount = goal.targetAmount - goal.savedAmount;

          if (remainingAmount <= goal.monthlyContribution) {
            user.pocket += job.salary - remainingAmount;
            goal.savedAmount += remainingAmount;
            goal.isAchieved = true;
          } else {
            user.pocket += job.salary - goal.monthlyContribution;
            goal.savedAmount += goal.monthlyContribution;
          }

          await goal.save({ session });
        } else {
          user.pocket += job.salary;
        }

        await user.save({ session });
      }

      await session.commitTransaction();
      console.log("Monthly job salary additions completed successfully.");
    } catch (error) {
      await session.abortTransaction();
      console.error("Error running monthly job salary additions:", error);
    } finally {
      session.endSession();
    }
  });
};
