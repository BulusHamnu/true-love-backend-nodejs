import { logError } from "../utils/helpers.js";
import User from "../models/user.js";
import Profile from "../models/profile.js";
import { profileUpdate } from "../utils/validators.js";
import Joi from "joi";
import sanitizeData from "../utils/sanitizeData.js";

// get profile handler
export async function getProfile(req, res) {
  try {
    // check if user already exist
    const user = await User.findOne({ email: req.user.email });
    if (!user)
      return res
        .status(404)
        .json({ status: true, message: "User does not exist." });

    // get user profile
    const userProfile = await Profile.findOne({ userId: req.user.id });

    res.status(200).json({
      status: true,
      message: "Profile retrieved sucessfully",
      data: {
        ...userProfile.toObject(),
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    logError("An error occur retriving user profile", error.message);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
      error: error.message,
    });
  }
}

// update profile handler
export async function updateProfile(req, res) {
  // check if user already exist
  const user = await User.findOne({ email: req.user.email });
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
      { email: req.user.email },
      { $set: { ...data } },
      { new: true }
    );

    res.status(200).json({
      status: true,
      message: "Profile updated sucessfully.",
      data: { ...updateUser.toObject(), isVerified: user.isVerified },
    });
  } catch (error) {
    logError("An error occur while updating user profile", error.message);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
      error: error.message,
    });
  }
}

// get self-guided-progress
export async function getProgramProgress(req, res) {
  try {
    // get user profile
    const userProfile = await Profile.findOne({ userId: req.user.id });

    res.status(200).json({
      status: true,
      message: "Self-guided program progress retrieved sucessfully",
      data: userProfile.programProgress,
    });
  } catch (error) {
    logError(
      "An error occur retriving self-guided program progress.",
      error.message
    );
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
      error: error.message,
    });
  }
}

// update self-guided-progress
export async function updateProgramProgress(req, res) {
  try {
    const cleanData = sanitizeData(req.body)
    const { weekNumber } = cleanData;

    const validator = Joi.number().required().min(0).max(6).label("weekNumber");
    const validate = validator.validate(weekNumber);

    if (validate.error)
      return res.status(400).json({
        status: false,
        message: validate.error.message,
      });

    // get user profile
    const userProfile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { "programProgress.week": weekNumber } },
      { new: true }
    );

    res.status(200).json({
      status: true,
      message: "Self-guided progress update sucessfully.",
      data: userProfile.programProgress,
    });
  } catch (error) {
    logError(
      "An error occur update self-guided program progress.",
      error.message
    );
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
      error: error.message,
    });
  }
}
