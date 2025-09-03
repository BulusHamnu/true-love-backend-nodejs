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
    const { currentWeek } = cleanData;

    const validator = Joi.number()
      .required()
      .min(0)
      .max(6)
      .label("currentWeek");
    const validate = validator.validate(currentWeek);

    if (validate.error)
      return res.status(400).json({
        status: false,
        message: validate.error.message,
      });

    // get user profile
    const userProfile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { "programProgress.currentWeek": currentWeek } },
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
    const { message } = req.body;
    const weekNumber = req.params.weekNumber;

    // validate and sanitize data
    const validator = Joi.string().required().label("message");
    const validate = validator.validate(message);
    if (validate.error)
      return res
        .status(400)
        .json({ status: false, message: validate.error.message });

    // get openai response
    const response = await postReflectionStory(message);
    if (!response.status)
      return res
        .status(500)
        .json({ status: false, message: "Response not available." });
    res.status(200).json({
      status: true,
      message: "ChatGPT reflection response",
      data: { message: response.message + " " + weekNumber },
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
