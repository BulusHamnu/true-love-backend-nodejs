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
import mongoose from "mongoose";

function generateHashValue(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

/* Sign up user */
export function createEmailVerificationCode() {
  const code = generateCode(6);
  const codeHash = generateHashValue(code);

  return {
    code,
    codeHash,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  };
}

export async function createNewUser({
  provider = "local",
  email,
  fullName,
  googleId = null,
  idToken = "",
  password,
  age,
  phone,
}) {
  const userExist = await User.findOne({ email }).lean();
  if (userExist)
    throw new AppError(
      ErrorCodes.USER_ALREADY_EXISTS,
      "User already exist.",
      409,
      true,
    );

  const hashedPassword = await bcrypt.hash(password, Env.PASSWORD_HASH_SALT);
  const { code, expiresAt, codeHash } = createEmailVerificationCode();

  const isVerified = provider === "google" ? true : false;
  const emailVerification = isVerified ? {} : { code: codeHash, expiresAt };
  const userGoogleIds = isVerified && googleId ? { googleId, idToken } : {};

  const session = await mongoose.startSession();
  let newUser = undefined;
  try {
    await session.withTransaction(async () => {
      newUser = new User({
        provider,
        password: hashedPassword,
        email,
        emailVerification,
        google: userGoogleIds,
        isVerified,
      });
      await newUser.save({ session });

      const profile = new Profile({
        userId: newUser._id,
        fullName,
        phone,
        age,
      });
      await profile.save({ session });
    });

    Logger.info("User created sucessfully.", {
      id: newUser._id,
    });
    //
  } finally {
    await session.endSession();
  }

  // Send verfication email if user is not verified or not google
  if (!isVerified)
    await sendResendEmail(
      email,
      "Please verify your email address",
      EmailTemplates.emailVerificationTemplate(fullName, code),
    );

  return {
    id: newUser._id,
    email: newUser.email,
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

  const accessToken = signToken({
    email: user.email,
    id: user._id,
    type: "accessToken",
  });

  const refreshToken = signToken({
    email: user.email,
    id: user._id,
    type: "refreshToken",
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      isVerified: user.isVerified,
      isActive: user.isActive,
      role: user.role,
      provider: user.provider,
      createdAt: user.createdAt,
    },
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

    const accessToken = signToken({
      email: user.email,
      id: user._id,
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
  const otpCodeHash = generateHashValue(otpCode);
  const otpCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  user.resetPasswordVerification.otpCode = otpCodeHash;
  user.resetPasswordVerification.otpCodeExpiresAt = otpCodeExpiresAt;
  await user.save();

  await sendResendEmail(
    email,
    "Reset Your Password",
    EmailTemplates.passwordVerificationTemplate(otpCode),
  );
}

/* Verify reset otp  */
function validateHashedSecret({
  value,
  storedHash,
  expiresAt,
  invalidError,
  expiredError,
}) {
  const hashCode = generateHashValue(value);
  const isValid = hashCode === storedHash;
  if (!isValid) throw invalidError;

  const isExpired = new Date(expiresAt) < new Date();
  if (isExpired) throw expiredError;
}

function validateResetOtpCode(code, otpHashValue, otpCodeExpiresAt) {
  return validateHashedSecret({
    value: code,
    storedHash: otpHashValue,
    expiresAt: otpCodeExpiresAt,
    invalidError: new AppError(
      ErrorCodes.RESET_OTP_INVALID,
      "Code is invalid.",
      400,
      true,
    ),
    expiredError: new AppError(
      ErrorCodes.RESET_OTP_EXPIRED,
      "Code expired.",
      400,
      true,
    ),
  });
}

function generateResetToken() {
  return crypto.randomBytes(16).toString("hex");
}

export async function verifyOptCodeAndIssueToken(code, email) {
  const user = await User.findOne({ email });
  if (!user)
    throw new AppError(ErrorCodes.USER_NOT_FOUND, "User not found.", 404, true);

  const optHashValue = user.resetPasswordVerification.otpCode;
  const optCodeExpiresAt = user.resetPasswordVerification.otpCodeExpiresAt;
  validateResetOtpCode(code, optHashValue, optCodeExpiresAt);

  const resetToken = generateResetToken();
  const resetTokenHash = generateHashValue(resetToken);
  const resetTokenExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

  user.resetPasswordVerification.resetToken = resetTokenHash;
  user.resetPasswordVerification.resetTokenExpiresAt = resetTokenExpiresAt;
  user.resetPasswordVerification.otpCode = null;
  user.resetPasswordVerification.otpCodeExpiresAt = null;
  await user.save();

  return resetToken;
}

/* Reset password function */
async function validateResetToken(resetToken, tokenHashValue, tokenExpiresAt) {
  return validateHashedSecret({
    value: resetToken,
    storedHash: tokenHashValue,
    expiresAt: tokenExpiresAt,
    invalidError: new AppError(
      ErrorCodes.RESET_TOKEN_INVALID,
      "Token is invalid.",
      400,
      true,
    ),
    expiredError: new AppError(
      ErrorCodes.RESET_TOKEN_EXPIRED,
      "Token expired.",
      400,
      true,
    ),
  });
}

export async function resetPassword(email, password, resetToken) {
  const user = await User.findOne({ email });
  if (!user)
    throw new AppError(ErrorCodes.USER_NOT_FOUND, "User not found.", 404, true);

  const tokenHashValue = user.resetPasswordVerification.resetToken;
  const tokenExpiresAt = user.resetPasswordVerification.resetTokenExpiresAt;
  await validateResetToken(resetToken, tokenHashValue, tokenExpiresAt);

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
      "User already verified.",
      400,
      true,
      {
        isVerified: user.isVerified,
      },
    );

  const { code, expiresAt, codeHash } = createEmailVerificationCode();
  await User.findOneAndUpdate(
    { _id: user.id },
    {
      emailVerification: {
        code: codeHash,
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
function validateVerificationCode(code, codeHashValue, codeExpiresAt) {
  return validateHashedSecret({
    value: code,
    storedHash: codeHashValue,
    expiresAt: codeExpiresAt,
    invalidError: new AppError(
      ErrorCodes.VERIFICATION_CODE_INVALID,
      "Code is invalid",
      400,
      true,
    ),
    expiredError: new AppError(
      ErrorCodes.VERIFICATION_CODE_EXPIRED,
      "Code expired.",
      400,
      true,
    ),
  });
}

export async function verifyUserEmail(code, email) {
  const user = await User.findOne({ email });
  if (!user)
    throw new AppError(ErrorCodes.USER_NOT_FOUND, "User not found.", 404, true);

  const codeHashValue = user.emailVerification.code;
  const codeExpiresAt = user.emailVerification.expiresAt;
  validateVerificationCode(code, codeHashValue, codeExpiresAt);

  user.isVerified = true;
  user.emailVerification.code = null;
  user.emailVerification.expiresAt = null;
  await user.save();
}
