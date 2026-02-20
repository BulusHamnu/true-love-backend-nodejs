import Profile from "../models/profile.model.js";
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

/* Post reflection message */
export async function postReflectionMessage({ userId, weekNumber, message }) {
  const selfGuidedDetails = await retriveUserSelfGuidedProgram(userId);

  const reflectionMessages = selfGuidedDetails.reflections;
  const messageExists = reflectionMessages.find(
    (reflection) => reflection.week === weekNumber,
  );

  const gptResponse = await sendReflectionMessageToGPT(weekNumber, message);
  if (messageExists) {
    const updatedSelfGuidedDetails = await selfGuidedProgram
      .findOneAndUpdate(
        {
          _id: selfGuidedDetails._id,
        },
        { $set: { "reflections.$[elem].message": message } },
        { arrayFilters: [{ "elem.week": weekNumber }], new: true },
      )
      .lean();

    return updatedSelfGuidedDetails.reflections.find(
      (reflection) => reflection.week === weekNumber,
    );
  }

  const newMessage = {
    week: weekNumber,
    message,
    gptResponse,
  };

  const updatedSelfGuidedDetails = await selfGuidedProgram
    .findOneAndUpdate(
      {
        _id: selfGuidedDetails._id,
      },
      { $push: { reflections: newMessage } },
      { new: true },
    )
    .lean();

  return updatedSelfGuidedDetails.reflections.find(
    (reflection) => reflection.week === weekNumber,
  );
}
