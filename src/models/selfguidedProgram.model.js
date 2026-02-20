import mongoose from "mongoose";

/* SelfGuidedProgram schema defination*/
const selfGuidedProgramSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  },
  currentWeek: {
    type: Number,
    default: 0,
  },
  totalWeek: {
    type: Number,
    default: 6,
  },
  reflections: [
    {
      week: {
        type: Number,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      gptResponse: {
        type: String,
        default: null,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const selfGuidedProgram = mongoose.model(
  "SelfGuidedProgram",
  selfGuidedProgramSchema,
);

export default selfGuidedProgram;
