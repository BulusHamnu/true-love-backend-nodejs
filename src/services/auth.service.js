import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import { generateCode, signToken } from "../utils/helpers.js";
import Logger from "../utils/logger.js";
import sendResendEmail from "./resend.js";
import AppError, { ErrorCodes } from "../errors/appError.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import EmailTemplates from "../utils/emailTemplates.js";
import Env from "../config/index.js";
import crypto from "crypto";

/* Sign up user */
export function createEmailVerificationCode() {
  return {
    code: generateCode(6),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  };
}

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
      ErrorCodes.USER_ALREADY_EXISTS,
      "User already exist.",
      409,
      true,
    );

  const isVerified = provider === "google" ? true : false;
  const hashedPassword = await bcrypt.hash(password, Env.PASSWORD_HASH_SALT);

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

  Logger.info("User created sucessfully.", {
    id: newUser._id,
  });

  // Send verfication email if user is not verified or not google
  if (!isVerified)
    await sendResendEmail(
      email,
      "Please verify your email address",
      EmailTemplates.emailVerificationTemplate(
        fullName,
        emailVerification?.code,
      ),
    );

  return {
    id: newUser._id,
    email: newUser.email,
    ...userProfile.removeUnwantedFields(),
    isVerified: newUser.isVerified,
  };
}

/* Login user */
export async function validatePasswordAndSignTokens({ email, password }) {
  const user = await User.findOne({ email: email });
  if (!user)
    throw new AppError(ErrorCodes.USER_NOT_FOUND, "User not found.", 404, true);

  const passwordCorrect = await bcrypt.compare(password, user.password);
  if (!passwordCorrect) {
    if (user.provider === "google")
      throw new AppError(
        ErrorCodes.PASSWORD_INCORRECT,
        "Incorect password, please login with Google or reset your password.",
        401,
        true,
      );

    throw new AppError(
      ErrorCodes.PASSWORD_INCORRECT,
      "Incorect password",
      401,
      true,
    );
  }

  let safeUserData = user.removeUnwantedFields();
  const accessToken = signToken({
    ...safeUserData,
    id: safeUserData._id,
    type: "accessToken",
  });

  const refreshToken = signToken({
    ...safeUserData,
    id: safeUserData._id,
    type: "refreshToken",
  });

  return {
    accessToken,
    refreshToken,
    user: { id: safeUserData._id, ...safeUserData },
  };
}

/* Refresh access token */
export async function refreshAccessToken(refreshToken) {
  try {
    if (!refreshToken) {
      throw new AppError(ErrorCodes.UNAUTHORIZED, "Unauthorized.", 401, true);
    }

    const tokenPayload = jwt.verify(refreshToken, Env.REFRESH_TOKEN_SECRET_KEY);
    if (tokenPayload.type !== "refreshToken") {
      throw new AppError(
        ErrorCodes.REFRESH_TOKEN_INVALID,
        "Unauthorized.",
        401,
        true,
      );
    }

    const user = await User.findOne({ _id: tokenPayload.id });
    if (!user) {
      throw new AppError(
        ErrorCodes.USER_NOT_FOUND,
        "User not found.",
        404,
        true,
      );
    }

    const safeUserData = user.removeUnwantedFields();
    const accessToken = signToken({
      ...safeUserData,
      id: safeUserData._id,
      type: "accessToken",
    });

    return accessToken;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AppError(
        ErrorCodes.REFRESH_TOKEN_EXPIRED,
        "Session has expired, please log in..",
        401,
        true,
      );
    }

    if (error.name === "JsonWebTokenError") {
      throw new AppError(
        ErrorCodes.REFRESH_TOKEN_INVALID,
        "Session has expired, please log in.",
        401,
        true,
      );
    }

    throw error;
  }
}

/* Send reset opt code function */
export async function createAndSendPasswordResetOpt(email) {
  const user = await User.findOne({ email });
  if (!user)
    throw new AppError(ErrorCodes.USER_NOT_FOUND, "User not found.", 404, true);

  const otpCode = generateCode(6);
  const otpCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  user.resetPasswordVerification.otpCode = otpCode;
  user.resetPasswordVerification.otpCodeExpiresAt = otpCodeExpiresAt;
  await user.save();

  // send verfication email
  await sendResendEmail(
    email,
    "Reset Your Password",
    EmailTemplates.passwordVerificationTemplate(otpCode),
  );
}

/* Verify reset otp  */
function generateResetToken() {
  return crypto.randomBytes(16).toString("hex");
}
export async function verifyOptCodeAndIssueToken(code) {
  const user = await User.findOne({
    "resetPasswordVerification.otpCode": code,
    "resetPasswordVerification.otpCodeExpiresAt": { $gt: new Date() },
  });

  if (!user)
    throw new AppError(
      ErrorCodes.RESET_OTP_INVALID,
      "Code expired or code is invalid",
      400,
      true,
    );

  const resetToken = generateResetToken();
  const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  user.resetPasswordVerification.otpCode = null;
  user.resetPasswordVerification.otpCodeExpiresAt = null;
  user.resetPasswordVerification.resetToken = resetToken;
  user.resetPasswordVerification.resetTokenExpiresAt = resetTokenExpiresAt;
  await user.save();

  return resetToken;
}

/* Reset password function */
export async function resetPassword(password, resetToken) {
  const user = await User.findOne({
    "resetPasswordVerification.resetToken": resetToken,
    "resetPasswordVerification.resetTokenExpiresAt": { $gt: new Date() },
  });

  if (!user)
    throw new AppError(
      ErrorCodes.RESET_TOKEN_EXPIRED,
      "Reset token has expired.",
      400,
      true,
    );

  const newPassword = await bcrypt.hash(password, Env.PASSWORD_HASH_SALT);
  user.password = newPassword;
  user.resetPasswordVerification.resetToken = null;
  user.resetPasswordVerification.resetTokenExpiresAt = null;
  await user.save();

  Logger.info("User password reset sucessful", {
    email: user.email,
  });

  await sendResendEmail(
    user.email,
    "Password reset sucessfully.",
    EmailTemplates.paswordResetSucessful(user.fullName),
  );
}

/* Resend verification code */
export async function sendEmailVerificationCode(user) {
  if (user.isVerified)
    throw new AppError(
      ErrorCodes.EMAIL_ALREADY_VERIFIED,
      "User already verified",
      400,
      true,
      {
        isVerified: user.isVerified,
      },
    );

  const { code, expiresAt } = createEmailVerificationCode();
  await User.findOneAndUpdate(
    { _id: user.id },
    {
      emailVerification: {
        code,
        expiresAt,
      },
    },
  );

  await sendResendEmail(
    user.email,
    "Please verify your email address",
    EmailTemplates.emailVerificationTemplate("Cupid's chosen", code),
  );
}

/* Verify email verification code */
export async function verifyEmailVerificationCode(code) {
  const user = await User.findOne({
    "emailVerification.code": code,
    "emailVerification.expiresAt": { $gt: new Date() },
  });

  if (!user)
    throw new AppError(
      ErrorCodes.VERIFICATION_CODE_INVALID,
      "Code expired or code is invalid",
      400,
      true,
    );

  user.isVerified = true;
  user.emailVerification.code = null;
  user.emailVerification.expiresAt = null;
  await user.save();
}
