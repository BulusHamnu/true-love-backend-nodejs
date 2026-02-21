import mongoose from "mongoose";

/* Schema */
const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  stripeCustomerId: {
    type: String,
    default: "",
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
profileSchema.index({ userId: 1 });

/* Methods */
profileSchema.methods.removeUnwantedFields = function () {
  const obj = this.toObject();
  delete obj.selfGuidedProgram;
  delete obj.transactions;
  return obj;
};

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
