import Profile from "../models/profile.model.js";

/* Get user profile */
export async function getProfile(userId) {
  return await Profile.findOne({ userId }).lean();
}

/* Update user profile */
export async function updateProfile(userId, updates) {
  const allowedFields = ["fullName", "phone", "age"];
  // Update only allowed fields
  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key)) return;
    delete updates[key];
  });

  const updatedProfile = await Profile.findOneAndUpdate(
    { userId },
    { $set: { ...updates } },
    { new: true },
  ).lean();

  return updatedProfile;
}
