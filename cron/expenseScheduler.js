import cron from "node-cron";
import expenseModel from "../models/expenseModel.js";
import userModel from "../models/userModel.js";

export const expenseScheduler = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const expensesToDeduct = await expenseModel.find({
        isRecurring,
        deductionDate: today,
      });
      for (const expense of expensesToDeduct) {
        const user = await userModel.findById(expense.user);
        if (user) {
          user.pocket -= expense.amount;
          await user.save();
          console.log(
            `Deducted ${expense.amount} from user ${user.name}'s balance.`
          );
        }
      }

      console.log("Daily expense deduction completed.");
    } catch (error) {
      console.error("Error running daily expense deduction cron job:", error);
    }
  });
};
