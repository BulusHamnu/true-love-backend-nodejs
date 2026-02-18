import Profile from "../models/profile.model.js";
import postReflectionStory from "../services/openai.js";
import Joi from "joi";
import * as selfGuidedService from "../services/selfGuidedProgram.service.js";
import * as selfGuidedValidator from "../utils/validators.js";
import validateAndSanitizeData from "../utils/validateAndSanitizeData.js";

/* Get self-guided-program handler */
export async function getSelfGuidedProgramHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const userSelfGuidedDetails =
      await selfGuidedService.retriveSelfGuidedDetails(userId);

    res.status(200).json({
      status: true,
      message: "Self Guided Program retrieved sucessfully",
      data: userSelfGuidedDetails,
    });
  } catch (error) {
    next(error);
  }
}

/* Update Self Guided progress handler*/
function validateSelfGuidedUpdateBody(body) {
  return validateAndSanitizeData(
    body,
    selfGuidedValidator.selfGuidedProgressBodySchema,
  );
}

export async function updateSelfGuidedProgramHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const { programProgress } = validateSelfGuidedUpdateBody(req.body);

    await selfGuidedService.updateSelfGuidedProgress(
      userId,
      programProgress.currentWeek,
    );

    res.status(200).json({
      status: true,
      message: "Self Guided Program progress updated sucessfully.",
    });
  } catch (error) {
    next(error);
  }
}

export async function reflectionCorner(req, res, next) {
  try {
    const { message } = req.body;
    const weekNumber = req.params.weekNumber;
    if (weekNumber <= 0 || weekNumber > 6)
      return res.status(400).json({
        status: false,
        message: "Week number cannot be less than 1 or greater than 6.",
      });

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
      message: "Reflection message posted successfully.",
      data: {
        reflectionMessage: message,
        chatGptResponse: response.message,
      },
    });
  } catch (error) {
    next(error);
  }
}
