import * as userService from "../services/user.service.js";
import * as profileBodyValidator from "../utils/validators.js";
import validateAndSanitizeData from "../utils/validateAndSanitizeData.js";

/* Get profile handler */
export async function getProfileHandler(req, res, next) {
  try {
    const user = req.user;
    const userProfile = await userService.getProfile(user);

    res.status(200).json({
      status: true,
      message: "Profile retrieved sucessfully",
      data: userProfile,
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

    const updatedUser = await userService.updateProfile(user, updatesData);

    res.status(200).json({
      status: true,
      message: "Profile updated sucessfully.",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}
