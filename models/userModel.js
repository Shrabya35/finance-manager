import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  authProvider: {
    type: String,
    enum: ["google", "custom"],
    required: true,
  },
  currency: {
    type: String,
    default: "₹",
  },
  pocket: {
    type: Number,
    default: 0,
  },
  googleId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("User", userSchema);
