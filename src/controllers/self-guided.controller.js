import Profile from "../models/profile.model.js";
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

/* Post reflection messages handler */
function validateReflectionMessageBody(body) {
  const reflectionMessageBodySchema = Joi.object({
    weekNumber: Joi.number().min(1).max(6).required(),
    message: Joi.string().required().min(10),
  });

  return validateAndSanitizeData(body, reflectionMessageBodySchema);
}

export async function reflectionMessagesHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const { message, weekNumber } = validateReflectionMessageBody(req.body);

    const { reflectionMessage, gptResponse } =
      await selfGuidedService.postReflectionMessage({
        userId,
        weekNumber,
        reflectionMessage: message,
      });

    res.status(200).json({
      status: true,
      message: "Reflection message posted successfully.",
      data: {
        reflectionMessage,
        gptResponse,
      },
    });
  } catch (error) {
    next(error);
  }
}
