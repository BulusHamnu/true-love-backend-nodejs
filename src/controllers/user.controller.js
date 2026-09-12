import * as userService from "../services/user.service.js";
import * as profileBodyValidator from "../utils/validators.js";
import validateAndSanitizeData from "../utils/validateAndSanitizeData.js";
import { mapUserToResponse } from "../mappers/user.mapper.js";

/* Get profile handler */
export async function getProfileHandler(req, res, next) {
  try {
    const user = req.user;

    const userProfile = await userService.getProfile(user.id);
    const userProfileResponse = mapUserToResponse({ ...user, ...userProfile });

    res.status(200).json({
      status: true,
      message: "Profile retrieved successfully.",
      data: userProfileResponse,
    });
  } catch (error) {
    next(error);
  }
}

/* Update profile handler */
export async function updateProfileHandler(req, res, next) {
  try {
    const user = req.user;
    const updatesData = validateAndSanitizeData(
      req.body,
      profileBodyValidator.profileUpdateBodySchema,
    );

    const updatedUser = await userService.updateProfile(user.id, updatesData);
    const updatedUserResponse = mapUserToResponse({ ...user, ...updatedUser });

    res.status(200).json({
      status: true,
      message: "Profile updated successfully.",
      data: updatedUserResponse,
    });
  } catch (error) {
    next(error);
  }
}
