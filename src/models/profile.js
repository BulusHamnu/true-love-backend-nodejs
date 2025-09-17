import mongoose from "mongoose";

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
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: "",
    // required: true,
  },
  age: {
    type: Number,
    default: null,
  },
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
  paidForCoaching: {
    type: Boolean,
    default: false,
  },
  selfGuidedProgram: {
    programProgress: {
      currentWeek: {
        type: Number,
        default: 0,
      },
      totalWeek: {
        type: Number,
        default: 6,
      },
    },
    reflectionMessages: {
      week1: {
        type: String,
        default: "",
      },
      week2: {
        type: String,
        default: "",
      },
      week3: {
        type: String,
        default: "",
      },
      week4: {
        type: String,
        default: "",
      },
      week5: {
        type: String,
        default: "",
      },
      week6: {
        type: String,
        default: "",
      },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// create an indexes
profileSchema.index({ email: 1 });
profileSchema.index({ userId: 1 });

// remove unwanted feilds methods
profileSchema.methods.removeUnwantedFields = function () {
  const obj = this.toObject();
  delete obj.selfGuidedProgram;
  delete obj.transactions;
  return obj;
};

const Profile =
  mongoose.models.Profile || mongoose.model("Profile", profileSchema);
export default Profile;
