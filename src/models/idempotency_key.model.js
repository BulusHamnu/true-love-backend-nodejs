import mongoose from "mongoose";
import { Schema } from "mongoose";

/* Idempotency Key Table */
const idempotencyKey = new mongoose.Schema({
  key: {
    type: String,
    unique: true,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  responseBody: {
    type: Schema.Types.Mixed,
    required: true,
  },
  requestHash: {
    type: Schema.Types.Mixed,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const IdempotencyKey = mongoose.model("IdempotencyKey", idempotencyKey);
export default IdempotencyKey;
