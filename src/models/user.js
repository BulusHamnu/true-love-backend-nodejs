import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  resetPasswordVerification: {
    code: String,
    expireAt: Date,
  },
  emailVerification: {
    code: String,
    expireAt: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// create an indexes
userSchema.index({ email: 1 });

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
