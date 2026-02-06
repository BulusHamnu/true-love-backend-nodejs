import mongoose from "mongoose";

/* Schema */
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
  isActive: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    default: "user",
  },
  resetPasswordVerification: {
    otpCode: String,
    otpCodeExpiresAt: Date,
    resetToken: String,
    resetTokenExpiresAt: Date,
  },
  emailVerification: {
    code: String,
    expireAt: Date,
  },
  provider: {
    type: String,
    default: "",
  },
  google: {
    googleId: {
      type: String,
      default: "",
    },
    idToken: {
      type: String,
      default: "",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* Indexes */
userSchema.index({ email: 1 });

/* Methods */
userSchema.methods.removeUnwantedFields = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordVerification;
  delete obj.emailVerification;
  delete obj.google;
  return obj;
};

const User = mongoose.model("User", userSchema);
export default User;
