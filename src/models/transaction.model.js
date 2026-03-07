import mongoose from "mongoose";

/* Schema */
const transactionSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "failed", "paid", "refunded"],
  },
  type: {
    type: String,
    required: true,
    enum: ["coaching-program", "self-guided-program"],
  },
  paymentIntent: {
    type: String,
    required: true,
    minLength: 4,
  },
  receipt: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* Indexes */
transactionSchema.index({ userId: 1 });
transactionSchema.index(
  { paymentIntent: 1 },
  {
    unique: true,
    partialFilterExpression: { paymentIntent: { $type: "string" } },
  },
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
