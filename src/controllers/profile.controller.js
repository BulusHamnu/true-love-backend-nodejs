import Logger from "../utils/logger.js";
import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import { profileUpdate } from "../utils/validators.js";
import sanitizeData from "../utils/sanitizeData.js";

// get profile handler
export async function getProfile(req, res) {
  try {
    // check if user already exist
    const user = await User.findOne({ _id: req.user.id });
    if (!user)
      return res
        .status(404)
        .json({ status: true, message: "User does not exist." });

    // get user profile
    const userProfile = await Profile.findOne({ userId: user._id });
    const safeUserProfileData = userProfile.removeUnwantedFields();
    const safeUserData = user.removeUnwantedFields();

    res.status(200).json({
      status: true,
      message: "Profile retrieved sucessfully",
      data: {
        ...safeUserProfileData,
        ...safeUserData,
        id: safeUserData._id,
      },
    });
  } catch (error) {
    Logger.error(error.message);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
    });
  }
}

// update profile handler
export async function updateProfile(req, res) {
  // check if user already exist
  const user = await User.findOne({ _id: req.user.id });
  if (!user)
    return res
      .status(404)
      .json({ status: true, message: "User does not exist." });

  const allowedFields = ["fullName", "phone", "age"];

  try {
    let data = sanitizeData(req.body);

    if (Object.keys(data).length === 0)
      return res
        .status(400)
        .json({ status: false, message: "Please provide data to update" });

    // delete not allowed key
    Object.keys(data).forEach((key) => {
      if (allowedFields.includes(key)) return;
      delete data[key];
    });

    // validate body
    const validate = profileUpdate.validate({
      fullName: data.fullName,
      phone: data.phone,
      age: data.age,
    });
    if (validate.error)
      return res
        .status(400)
        .json({ status: false, message: validate.error.message });

    // update user
    const updateUser = await Profile.findOneAndUpdate(
      { userId: user._id },
      { $set: { ...data } },
      { new: true },
    );

    const safeUserProfileData = updateUser.removeUnwantedFields();
    const safeUserData = user.removeUnwantedFields();

    res.status(200).json({
      status: true,
      message: "Profile updated sucessfully.",
      data: {
        ...safeUserProfileData,
        ...safeUserData,
      },
    });
  } catch (error) {
    Logger.error(error);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
    });
  }
}
