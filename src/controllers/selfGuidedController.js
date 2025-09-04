import { logError } from "../utils/helpers.js";
import Profile from "../models/profile.js";
import Joi from "joi";
import sanitizeData from "../utils/sanitizeData.js";
import postReflectionStory from "../services/openai.js";
import { selfGuidedValidator } from "../utils/validators.js";

// get self-guided-progress
export async function getSelfGuidedProgram(req, res) {
  try {
    // get user profile
    const userProfile = await Profile.findOne({ userId: req.user.id });

    res.status(200).json({
      status: true,
      message: "Self-guided program detail retrieved sucessfully",
      data: userProfile.selfGuidedProgram,
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
export async function updateSelfGuidedProgram(req, res) {
  try {
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

    if (cleanData.reflectionMessages) {
      for (const [field, value] of Object.entries(
        cleanData.reflectionMessages
      )) {
        updates[`selfGuidedProgram.reflectionMessages.${field}`] = value;
      }
    }

    // get user profile
    const userProfile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates },
      { new: true }
    );

    res.status(200).json({
      status: true,
      message: "Self-guided updated sucessfully.",
      data: userProfile.selfGuidedProgram,
    });
  } catch (error) {
    logError("An error occur update self-guided program.", error.message);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
      error: error.message,
    });
  }
}

// export async function reflectionCorner(req, res) {
//   try {
//     const { message } = req.body;
//     const weekNumber = req.params.weekNumber;

//     // validate and sanitize data
//     const validator = Joi.string().required().label("message");
//     const validate = validator.validate(message);
//     if (validate.error)
//       return res
//         .status(400)
//         .json({ status: false, message: validate.error.message });

//     // get openai response
//     const response = await postReflectionStory(message);
//     if (!response.status)
//       return res
//         .status(500)
//         .json({ status: false, message: "Response not available." });
//     res.status(200).json({
//       status: true,
//       message: "ChatGPT reflection response",
//       data: { message: response.message + " " + weekNumber },
//     });
//   } catch (error) {
//     logError("An error occur while generating response.");
//     res.status(500).json({
//       status: false,
//       message: "An expected error occur.",
//       error: error.message,
//     });
//   }
// }

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
