import Joi from "joi";
import * as selfGuidedService from "../services/selfGuidedProgram.service.js";
import validateAndSanitizeData from "../utils/validateAndSanitizeData.js";

/* Get self-guided-program handler */
export async function getSelfGuidedProgramHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const userSelfGuidedDetails =
      await selfGuidedService.retriveUserSelfGuidedProgram(userId);

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
  const schema = Joi.object({
    currentWeek: Joi.number().min(1).max(6).messages({
      "number.min": "currentWeek cannot be less than 0",
      "number.max": "currentWeek cannot be greater than 6",
    }),
  });

  return validateAndSanitizeData(body, schema);
}

export async function updateSelfGuidedProgramHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const { currentWeek } = validateSelfGuidedUpdateBody(req.body);

    const updatedSelfGuided = await selfGuidedService.updateSelfGuidedProgress(
      userId,
      currentWeek,
    );

    res.status(200).json({
      status: true,
      message: "Self Guided Program updated sucessfully.",
      data: updatedSelfGuided,
    });
  } catch (error) {
    next(error);
  }
}

/* Post reflection messages handler */
function validateReflectionBody(body) {
  const reflectionBodySchema = Joi.object({
    weekNumber: Joi.number().min(1).max(6).required(),
    message: Joi.string().required().min(10),
  });

  return validateAndSanitizeData(body, reflectionBodySchema);
}

export async function reflectionMessageHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const { message, weekNumber } = validateReflectionBody(req.body);

    const newMessage = await selfGuidedService.postReflectionMessage({
      userId,
      weekNumber,
      message,
    });

    res.status(200).json({
      status: true,
      message: "Reflection message posted successfully.",
      data: newMessage,
    });
  } catch (error) {
    next(error);
  }
}

/* Get reflection message handler */
export async function getReflectionMessageHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const weekNumber = req.params.weekNumber;

    const message = await selfGuidedService.getReflectionMessage(
      userId,
      weekNumber,
    );

    res.status(200).json({
      status: true,
      message: "Reflection message retrived successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
}
