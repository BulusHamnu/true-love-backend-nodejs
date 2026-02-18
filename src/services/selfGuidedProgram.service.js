import Profile from "../models/profile.model.js";
import AppError, { ErrorCodes } from "../errors/appError.js";
import User from "../models/user.model.js";

/* Retrive user selfGuided program details */
export async function retriveSelfGuidedDetails(userId) {
  const userProfile = await Profile.findOne({ userId }).lean();

  if (!userProfile.hasPremium)
    throw new AppError(
      ErrorCodes.SELF_GUIDED_ACCESS_DENIED,
      "You do not have access to the self-guided program.",
      403,
      true,
      { hasPremium: userProfile.hasPremium },
    );

  return userProfile.selfGuidedProgram;
}

/* Update selfGuided program */
export async function updateSelfGuidedProgress(userId, currentWeek) {
  const userProfile = await Profile.findOne({ userId });

  if (!userProfile.hasPremium)
    throw new AppError(
      ErrorCodes.SELF_GUIDED_ACCESS_DENIED,
      "You do not have access to the self-guided program.",
      403,
      true,
      { hasPremium: userProfile.hasPremium },
    );

  userProfile.selfGuidedProgram.programProgress.currentWeek = currentWeek;
  await userProfile.save();
}
