import { expenseScheduler } from "./expenseScheduler.js";
import { jobScheduler } from "./jobScheduler.js";

export const setupCronJobs = () => {
  console.log("Initializing Cron Jobs...");
  expenseScheduler();
  jobScheduler();
};
