import mongoose from "mongoose";

const transactionSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  amount: Number,
  status: {
    type: String,
    enum: ["pending", "failed", "paid"],
  },
  type: {
    type: String,
    enum: ["coaching-program", "self-guided-program"],
  },
  paymentIntent: String,
  receipt: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);

export default Transaction;
