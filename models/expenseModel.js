import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  deductionDate: {
    type: Date,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
  },
});

export default mongoose.model("Expense", ExpenseSchema);
