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
    expiresAt: Date,
  },
  provider: {
    type: String,
    default: "local",
  },
  google: {
    googleId: {
      type: String,
    },
    idToken: {
      type: String,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* Indexes */
userSchema.index({ email: 1 }, { unique: true });
userSchema.index(
  { "google.googleId": 1 },
  {
    unique: true,
    partialFilterExpression: { "google.googleId": { $exists: true } },
  },
);

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
