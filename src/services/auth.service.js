import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import { generateCode } from "../utils/helpers.js";
import Logger from "../utils/logger.js";
import sendResendEmail from "./resend.js";
import AppError, { ErrorCodes } from "../errors/appError.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import EmailTemplates from "../utils/emailTemplates.js";
import Env from "../config/index.js";

/* Sign up user */
export function createEmailVerificationCode() {
  return {
    code: generateCode(6),
    expireAt: new Date(Date.now() + 15 * 60 * 1000),
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
      ErrorCodes.USER_ALREADY_EXIST,
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
function signToken({ email, id, isVerified, type }) {
  const tokenSecret =
    type === "refreshToken"
      ? Env.REFRESH_TOKEN_SECRET_KEY
      : Env.TOKEN_SECRET_KEY;
  const expiresIn = type === "refreshToken" ? "7d" : "24h";

  return jwt.sign(
    {
      email,
      id,
      isVerified,
      type,
    },
    tokenSecret,
    { expiresIn },
  );
}

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
