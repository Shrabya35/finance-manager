import cron from "node-cron";
import mongoose from "mongoose";
import expenseModel from "../models/expenseModel.js";
import userModel from "../models/userModel.js";

export const expenseScheduler = () => {
  //0:min, 0:hour, *:every day, *every month, *every day of week
  cron.schedule("0 0 * * *", async () => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split("T")[0];

      const expensesToDeduct = await expenseModel.find(
        {
          isRecurring: true,
          deductionDate: { $gte: monthStart, $lt: todayStr },
        },
        null,
        { session }
      );

      for (const expense of expensesToDeduct) {
        const user = await userModel.findById(expense.user, null, { session });
        if (user) {
          user.pocket -= expense.amount;
          await user.save({ session });

          const newExpense = new expenseModel({
            user: expense.user,
            name: expense.name,
            amount: expense.amount,
            isRecurring: false,
            deductionDate: expense.deductionDate,
          });

          await newExpense.save({ session });

          console.log(
            `Deducted ${expense.amount} from user ${user.name}'s balance for missed deduction on ${expense.deductionDate} and created a new non-recurring expense.`
          );
        }
      }

      await session.commitTransaction();
      console.log("Daily and missed expense deductions completed.");
    } catch (error) {
      await session.abortTransaction();
      console.error("Error running daily expense deduction cron job:", error);
    } finally {
      session.endSession();
    }
  });
};
