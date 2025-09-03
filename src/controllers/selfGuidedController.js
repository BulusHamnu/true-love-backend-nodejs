import { logError } from "../utils/helpers.js";
import Profile from "../models/profile.js";
import Joi from "joi";
import sanitizeData from "../utils/sanitizeData.js";
import postReflectionStory from "../services/openai.js";

// get self-guided-progress
export async function getProgramProgress(req, res) {
  try {
    // get user profile
    const userProfile = await Profile.findOne({ userId: req.user.id });

    res.status(200).json({
      status: true,
      message: "Self-guided program progress retrieved sucessfully",
      data: userProfile.programProgress,
    });
  } catch (error) {
    logError(
      "An error occur retriving self-guided program progress.",
      error.message
    );
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
      error: error.message,
    });
  }
}

// update self-guided-progress
export async function updateProgramProgress(req, res) {
  try {
    const cleanData = sanitizeData(req.body);
    const { weekNumber } = cleanData;

    const validator = Joi.number().required().min(0).max(6).label("weekNumber");
    const validate = validator.validate(weekNumber);

    if (validate.error)
      return res.status(400).json({
        status: false,
        message: validate.error.message,
      });

    // get user profile
    const userProfile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { "programProgress.week": weekNumber } },
      { new: true }
    );

    res.status(200).json({
      status: true,
      message: "Self-guided progress update sucessfully.",
      data: userProfile.programProgress,
    });
  } catch (error) {
    logError(
      "An error occur update self-guided program progress.",
      error.message
    );
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
      error: error.message,
    });
  }
}

export async function reflectionCorner(req, res) {
  try {
    const { userMessage } = req.body;
    // validate and sanitize data
    const validator = Joi.string().required().label("userMessage");
    const validate = validator.validate(userMessage);
    if (validate.error)
      return res
        .status(400)
        .json({ status: false, message: validate.error.message });

    // get openai response
    const response = await postReflectionStory(userMessage);
    if (!response.status)
      return res
        .status(500)
        .json({ status: false, message: "Response not available." });
    res.status(200).json({
      status: true,
      message: "ChatGPT reflection response",
      data: { message: response.message },
    });
  } catch (error) {
    logError("An error occur while generating response.");
    res.status(500).json({
      status: false,
      message: "An expected error occur.",
      error: error.message,
    });
  }
}
