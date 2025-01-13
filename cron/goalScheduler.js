import cron from "node-cron";
import goalModel from "../models/goalModel.js";

export const goalScheduler = () => {
  //0:min, 0:hour, *:every day, *every month, *every day of week
  cron.schedule("0 0 * * *", async () => {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      const result = await goalModel.updateMany(
        { expired: false, deadline: { $lte: todayStr } },
        { $set: { expired: true } }
      );

      console.log(
        `Goal expiration check completed. Updated ${result.modifiedCount} goals.`
      );
    } catch (error) {
      console.error("Error running goal expiration cron job:", error.message);
    }
  });
};
