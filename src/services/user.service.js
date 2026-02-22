import Profile from "../models/profile.model.js";

/* Get user profile */
export async function getProfile(user) {
  const userProfile = await Profile.findOne({ userId: user.id }).lean();

  return {
    id: user.id,
    email: user.email,
    isVerified: user.isVerified,
    isActive: user.isActive,
    role: user.role,
    provider: user.provider,
    ...userProfile,
  };
}

/* Update user profile */
export async function updateProfile(user, updates) {
  const allowedFields = ["fullName", "phone", "age"];
  // Update only allowed fields
  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key)) return;
    delete updates[key];
  });

  const updatedProfile = await Profile.findOneAndUpdate(
    { userId: user.id },
    { $set: { ...updates } },
    { new: true },
  ).lean();

  return {
    id: user.id,
    email: user.email,
    isVerified: user.isVerified,
    isActive: user.isActive,
    role: user.role,
    provider: user.provider,
    ...updatedProfile,
  };
}
