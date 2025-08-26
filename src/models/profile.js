import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  age: Number,
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
  ],
  hasPremium: {
    type: Boolean,
    default: false,
  },
  paidForCoaching : {
    type: Boolean,
    default: false
  },
  programProgress: {
    week: {
      type: Number,
      default: 0,
    },
    totalWeek: {
      type: Number,
      default: 6,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Profile =
  mongoose.models.Profile || mongoose.model("Profile", profileSchema);
export default Profile;
