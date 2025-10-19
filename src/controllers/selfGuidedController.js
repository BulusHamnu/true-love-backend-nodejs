import Profile from "../models/profile.js";
import { logger } from "../utils/helpers.js";
import sanitizeData from "../utils/sanitizeData.js";
import postReflectionStory from "../services/openai.js";
import { selfGuidedValidator } from "../utils/validators.js";
import Joi from "joi";

// get self-guided-progress
export async function getSelfGuidedProgram(req, res) {
  try {
    // get user profile
    const userProfile = await Profile.findOne({ userId: req.user.id });

    if (!userProfile.hasPremium)
      return res.status(400).json({
        status: false,
        message: "You do not have access to the self-guided program.",
      });

    res.status(200).json({
      status: true,
      message: "Self-guided program detail retrieved sucessfully",
      data: userProfile.selfGuidedProgram,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
    });
  }
}

// update self-guided-progress
export async function updateSelfGuidedProgram(req, res) {
  try {
    const userProfile = await Profile.findOne({ userId: req.user.id });

    if (!userProfile.hasPremium)
      return res.status(400).json({
        status: false,
        message: "You do not have access to the self-guided program.",
      });

    const validate = selfGuidedValidator.validate(req.body);
    if (validate.error)
      return res.status(400).json({
        status: false,
        message: validate.error.message,
      });

    const cleanData = sanitizeData(req.body);
    const updates = {};

    if (cleanData.programProgress) {
      for (const [field, value] of Object.entries(cleanData.programProgress)) {
        if (field === "total") return;
        updates[`selfGuidedProgram.programProgress.${field}`] = value;
      }
    }

    /* if (cleanData.reflectionMessages) {
      for (const [field, value] of Object.entries(
        cleanData.reflectionMessages
      )) {
        updates[`selfGuidedProgram.reflectionMessages.${field}`] = value;
      }
    } */

    // get user profile
    const userUpdate = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates },
      { new: true }
    );

    res.status(200).json({
      status: true,
      message: "Self-guided updated sucessfully.",
      data: userUpdate.selfGuidedProgram,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
    });
  }
}

export async function reflectionCorner(req, res) {
  try {
    const { message } = req.body;
    const weekNumber = req.params.weekNumber;
    if (weekNumber <= 0 || weekNumber > 6)
      return res
        .status(400)
        .json({
          status: false,
          message: "Week number cannot be less than 1 or greater than 6.",
        });

    // check if user paid for self-guided program
    const userProfile = await Profile.findOne({ userId: req.user.id });

    if (!userProfile.hasPremium)
      return res.status(400).json({
        status: false,
        message: "You do not have access to the self-guided program.",
      });

    // validate and sanitize data
    const msgValidator = Joi.string().required().label("message").min(10);
    const msgValidate = msgValidator.validate(message);
    if (msgValidate.error)
      return res
        .status(400)
        .json({ status: false, message: msgValidate.error.message });

    // get openai response
    const response = await postReflectionStory(weekNumber, message);

    // update week message
    userProfile.selfGuidedProgram.reflectionMessages[`week${weekNumber}`] =
      message;
    userProfile.selfGuidedProgram.gptResponses[`week${weekNumber}`] =
      response.message;
    await userProfile.save();

    res.status(200).json({
      status: true,
      message: "ChatGPT reflection response",
      data: {
        reflectionMessage: message,
        chatGptResponse: response.message,
      },
    });
  } catch (error) {
    logger.error("An error occur while generating response.", error);
    res.status(500).json({
      status: false,
      message: "An expected error occur.",
      error: error.message,
    });
  }
}

// export async function getAllReflectionMessages(req, res) {
//   try {
//     const userProfile = await Profile.findOne({ userId: req.user.id });
//     if (!userProfile)
//       res
//         .status(404)
//         .json({ status: false, message: "User profile not found." });

//     res.status(200).json({
//       status: true,
//       message: "Reflection messages retrive successfully.",
//       data: userProfile.selfGuidedProgram.reflectionMessages,
//     });
//   } catch (error) {
//     logError(
//       "An error occur while retriving reflection messages",
//       error.message
//     );
//     res.status(500).json({
//       status: false,
//       message: "An error occur while retriving reflection messages",
//       error: error.message,
//     });
//   }
// }
