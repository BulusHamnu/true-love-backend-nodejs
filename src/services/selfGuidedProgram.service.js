import AppError, { ErrorCodes } from "../errors/appError.js";
import sendReflectionMessageToGPT from "./openai.js";
import selfGuidedProgram from "../models/selfguidedProgram.model.js";

export async function createSelfGuidedProgram(userId) {
  try {
    await selfGuidedProgram.create({ userId });
  } catch (error) {
    if (error.code === 11000)
      Logger.error("User already has selfGuidedProgram data.", error);

    Logger.error(
      `Failed to create selfGuidedProgram data for: ${userId}`,
      error,
    );
  }
}

/* Retrieve user Self Guided Program  */
export async function retrieveUserSelfGuidedProgram(userId) {
  const selfGuidedExists = await selfGuidedProgram.findOne({ userId }).lean();

  if (!selfGuidedExists)
    throw new AppError(
      ErrorCodes.SELF_GUIDED_ACCESS_DENIED,
      "You do not have access to the self-guided program.",
      { status: 403, isOperational: true },
    );

  return selfGuidedExists;
}

/* Update selfGuided program progress */
export async function updateSelfGuidedProgress(userId, currentWeek) {
  const selfGuidedDetails = await retrieveUserSelfGuidedProgram(userId);
  const updatedSelfGuidedDetails = await selfGuidedProgram
    .findOneAndUpdate(
      {
        _id: selfGuidedDetails._id,
      },
      { $set: { currentWeek } },
      { new: true },
    )
    .lean();

  return updatedSelfGuidedDetails;
}

/* Get a single reflection message */
export async function getReflectionMessage(userId, weekNumber) {
  const selfGuidedDetails = await retrieveUserSelfGuidedProgram(userId);
  const reflectionMessages = selfGuidedDetails.reflections;

  const message = reflectionMessages.find(
    (reflection) => reflection.week === Number(weekNumber),
  );

  if (!message)
    throw new AppError(
      ErrorCodes.REFLECTION_MESSAGE_NOT_FOUND,
      "Reflection message not found.",
      {
        status: 404,
        isOperational: true,
        details: {
          week: weekNumber,
        },
      },
    );

  return message;
}

/* Post reflection message */
// Posting and Updating reflection message share the same method because the front-end have a simple message interface.
export async function postReflectionMessage({ userId, weekNumber, message }) {
  let updatedResult = await selfGuidedProgram.updateOne(
    {
      userId,
      "reflections.week": weekNumber,
    },
    {
      $set: {
        "reflections.$.message": message,
      },
    },
  );

  let newPushResult = null;
  if (updatedResult.matchedCount === 0) {
    const newMessage = {
      week: weekNumber,
      message,
    };

    newPushResult = await selfGuidedProgram.updateOne(
      {
        userId,
        "reflections.week": { $ne: weekNumber },
      },
      { $push: { reflections: newMessage } },
    );
  }

  const needsGPTResponse =
    updatedResult?.modifiedCount === 1 || newPushResult?.modifiedCount === 1;

  let selfGuidedDetails = undefined;
  if (needsGPTResponse) {
    const gptResponse = null; // await sendReflectionMessageToGPT(weekNumber, message); No GPT quota.

    selfGuidedDetails = await selfGuidedProgram
      .findOneAndUpdate(
        {
          userId,
          "reflections.week": weekNumber,
        },
        {
          $set: {
            "reflections.$.gptResponse": gptResponse,
          },
        },
        { new: true },
      )
      .lean();
  } else {
    selfGuidedDetails = await selfGuidedProgram.findOne({ userId }).lean();
  }

  return selfGuidedDetails.reflections.find(
    (reflection) => reflection.week === weekNumber,
  );
}
