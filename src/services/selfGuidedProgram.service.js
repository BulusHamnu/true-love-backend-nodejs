import AppError, { ErrorCodes } from "../errors/appError.js";
import sendReflectionMessageToGPT from "./openai.js";
import selfGuidedProgram from "../models/selfguidedProgram.model.js";

/* Retrive user Self Guided Program  */
export async function retriveUserSelfGuidedProgram(userId) {
  const selfGuidedExists = await selfGuidedProgram.findOne({ userId }).lean();

  if (!selfGuidedExists)
    throw new AppError(
      ErrorCodes.SELF_GUIDED_ACCESS_DENIED,
      "You do not have access to the self-guided program.",
      403,
      true,
    );

  return selfGuidedExists;
}

/* Update selfGuided program progress */
export async function updateSelfGuidedProgress(userId, currentWeek) {
  const selfGuidedDetails = await retriveUserSelfGuidedProgram(userId);
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
  const selfGuidedDetails = await retriveUserSelfGuidedProgram(userId);
  const reflectionMessages = selfGuidedDetails.reflections;

  const message = reflectionMessages.find(
    (reflection) => reflection.week === Number(weekNumber),
  );
  if (!message)
    throw new AppError(
      ErrorCodes.REFLECTION_MESSAGE_NOT_FOUND,
      "Reflection message not found.",
      404,
      true,
      {
        week: weekNumber,
      },
    );

  return message;
}

/* Post reflection message */
// Posting and Updating reflection message share the same method because the front-end have a simple message interface.
export async function postReflectionMessage({ userId, weekNumber, message }) {
  const gptResponse = await sendReflectionMessageToGPT(weekNumber, message);
  //
  try {
    await getReflectionMessage(userId, weekNumber); // If reflection message not found, it throw an error which will skip this block else it's an update.
    const updatedSelfGuidedDetails = await selfGuidedProgram
      .findOneAndUpdate(
        {
          userId,
        },
        { $set: { "reflections.$[elem].message": message } },
        { arrayFilters: [{ "elem.week": weekNumber }], new: true },
      )
      .lean();

    return updatedSelfGuidedDetails.reflections.find(
      (reflection) => reflection.week === weekNumber,
    );
  } catch (error) {
    // We do nothing, lol.
  }

  const newMessage = {
    week: weekNumber,
    message,
    gptResponse,
  };

  const updatedSelfGuidedDetails = await selfGuidedProgram
    .findOneAndUpdate(
      {
        userId,
      },
      { $push: { reflections: newMessage } },
      { new: true },
    )
    .lean();

  return updatedSelfGuidedDetails.reflections.find(
    (reflection) => reflection.week === weekNumber,
  );
}
