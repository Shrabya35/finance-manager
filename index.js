import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import morgan from "morgan";
import cors from "cors";
import connectDB from "./config/connectDB.js";
import authRoute from "./routes/authRoute.js";
import jobRoute from "./routes/jobRoute.js";
import expenseRoute from "./routes/expenseRoute.js";
import incomeRoute from "./routes/incomeRoute.js";
import goalRoute from "./routes/goalRoute.js";
import { setupCronJobs } from "./cron/cron.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 9080;

app.use(express.json());
app.use(morgan("dev"));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
  })
);

setupCronJobs();

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/expense", expenseRoute);
app.use("/api/v1/income", incomeRoute);
app.use("/api/v1/goal", goalRoute);

app.get("/", (req, res) => {
  res.send("<h1>Welcome to my app</h1>");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.bgBlue.white);
});
