import mongoose from "mongoose";

/* Schema */
const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  stripeCustomerId: {
    type: String,
  },
  fullName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: "",
  },
  age: {
    type: Number,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* Indexes */
profileSchema.index({ userId: 1 }, { unique: true });
profileSchema.index(
  { stripeCustomerId: 1 },
  {
    unique: true,
    partialFilterExpression: { stripeCustomerId: { $exists: true } },
  },
);

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
