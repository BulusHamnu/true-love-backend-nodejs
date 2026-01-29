import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import { logger, generateCode } from "../utils/helpers.js";
import sendResendEmail from "./resend.js";
import AppError, { ErrorCodes } from "../errors/appError.js";
import bcrypt from "bcryptjs";
import { templates } from "./email.js";

/* Create verification code function */
export function createEmailVerificationCode() {
  return {
    code: generateCode(6),
    expireAt: new Date(Date.now() + 15 * 60 * 1000),
  };
}

/* Sign up user */
export async function createNewUser({
  provider = "local",
  email,
  fullName,
  googleId = "",
  idToken = "",
  password,
  age,
  phone,
}) {
  const userExist = await User.findOne({ email: email });
  if (userExist)
    throw new AppError(
      ErrorCodes.USER_ALREADY_EXIST,
      "User already exist.",
      409,
      true,
    );

  const isVerified = provider === "google" ? true : false;
  const hashedPassword = await bcrypt.hash(password, 10);
  const emailVerification =
    provider !== "google" ? createEmailVerificationCode() : {};

  const newUser = await User.create({
    provider,
    password: hashedPassword,
    email,
    emailVerification,
    google: {
      googleId,
      idToken,
    },
    isVerified,
  });

  // Create profile
  const userProfile = await Profile.create({
    userId: newUser._id,
    fullName,
    phone,
    age,
  });

  logger.info("User created sucessfully.", {
    id: newUser._id,
  });

  // Send verfication email if user is not verified or not google
  if (!isVerified)
    await sendResendEmail(
      email,
      "Please verify your email address",
      templates.emailVerificationTemplate(fullName, emailVerification?.code),
    );

  return {
    id: newUser._id,
    email: newUser.email,
    ...userProfile.removeUnwantedFields(),
    isVerified: newUser.isVerified,
  };
}
