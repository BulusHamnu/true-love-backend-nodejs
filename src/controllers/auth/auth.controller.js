import { generateCode } from "../../utils/helpers.js";
import User from "../../models/user.model.js";
import Profile from "../../models/profile.model.js";
import sendResendEmail from "../../services/resend.js";
import EmailTemplates from "../../utils/emailTemplates.js";
import Env from "../../config/index.js";
import * as authValidator from "../../utils/validators.js";
import Joi from "joi";
import * as authService from "../../services/auth.service.js";
import validateAndSanitizeData from "../../utils/validateAndSanitizeData.js";
import Logger from "../../utils/logger.js";

/* Sign up user handler */
export async function signup(req, res, next) {
  try {
    const { fullName, password, email, age, phone } = validateAndSanitizeData(
      req.body,
      authValidator.signupSchema,
    );

    // create user
    const newUser = await authService.createNewUser({
      password,
      email,
      fullName,
      age,
      phone,
    });

    res.status(201).json({
      status: true,
      message: "User created sucessfully.",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
}

/* Login handler */
function clearRefreshToken(res) {
  const paths = ["/", "/api", "/api/auth"];

  for (const path of paths) {
    res.clearCookie("refreshToken", {
      ...Env.LOGIN_COOKIE_OPTS,
      path,
    });

    res.clearCookie("token", {
      ...Env.LOGIN_COOKIE_OPTS,
      path,
    });
  }
}

export async function login(req, res, next) {
  try {
    const { password, email } = validateAndSanitizeData(
      req.body,
      authValidator.loginBodySchema,
    );

    const { accessToken, refreshToken, user } =
      await authService.validatePasswordAndSignTokens({
        email,
        password,
      });

    clearRefreshToken(res); // Util function to clear all user cookies as a refresh because we changed the auth system. Will remove later

    res.cookie("refreshToken", refreshToken, Env.LOGIN_COOKIE_OPTS);
    res.status(200).json({
      status: true,
      message: "Login sucessful.",
      data: { user, accessToken },
    });
  } catch (error) {
    next(error);
  }
}

/* Refresh token handler */
export async function refreshToken(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;
    const accessToken = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      status: true,
      message: "Session refresh successfully.",
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
}

/* Logout handler */
export async function logout(req, res, next) {
  try {
    res.clearCookie("refreshToken", Env.LOGIN_COOKIE_OPTS);
    res.status(200).json({
      status: true,
      message: "User logout sucessfully",
    });
  } catch (error) {
    next(error);
  }
}

/* Forget password handler */
function validateForgetPasswordBody(data) {
  const schema = Joi.object({
    email: authValidator.emailField,
  });

  return validateAndSanitizeData(data, schema);
}
export async function forgetPassword(req, res, next) {
  try {
    const { email } = validateForgetPasswordBody(req.body);
    await authService.createAndSendPasswordResetOpt(email);

    res.status(200).json({
      status: true,
      message: "Password reset email was sent sucessfully.",
    });
  } catch (error) {
    next(error);
  }
}

/* Verify password reset code handler */
function validateOptCodeBody(data) {
  const schema = Joi.object({
    code: Joi.string().required().length(6),
  });
  return validateAndSanitizeData(data, schema);
}

export async function verifyPasswordResetOpt(req, res, next) {
  try {
    const { code } = validateOptCodeBody(req.body);
    const resetToken = await authService.verifyOptCodeAndIssueToken(code);

    res.status(200).json({
      status: true,
      message: "Code is valid",
      data: { resetToken },
    });
  } catch (error) {
    next(error);
  }
}

/* Reset password handler */
export async function resetPassword(req, res, next) {
  try {
    const { password, resetToken } = validateAndSanitizeData(
      req.body,
      authValidator.resetPasswordBodySchema,
    );

    await authService.resetPassword(password, resetToken);
    res.status(200).json({
      status: true,
      message: "Password was reset sucessfully.",
    });
  } catch (error) {
    next(error);
  }
}

// resend email handler
export async function resendEmail(req, res) {
  try {
    // check if user exist
    const email = req.body.email;
    if (!email)
      res
        .status(404)
        .json({ status: false, message: "Please provide an email." });
    Logger.info("Email received for verification.", { email });
    // receive email from body
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ status: true, message: "User does not exist." });

    // check if user is already verfied
    if (user.isVerified)
      return res.status(409).json({
        status: false,
        message: "User is already verified",
      });

    Logger.info("Email verification requested", {
      email: email,
    });

    // generate verification code
    const verficationCode = generateCode(6);

    // update user
    user.emailVerification.code = verficationCode;
    user.emailVerification.expireAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // send verfication email
    await sendResendEmail(
      email,
      "Please verify your email address",
      EmailTemplates.emailVerificationTemplate(user.fullName, verficationCode),
    );

    res.status(200).json({
      status: true,
      message: "Email was sent sucessfully.",
    });
  } catch (error) {
    Logger.error(error);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
    });
  }
}

// verify email handler
export async function verifyEmail(req, res) {
  try {
    const { code } = req.body;
    if (!code)
      return res.status(400).json({
        status: false,
        message: "Please provide verification code.",
      });

    // check if user already exist
    const user = await User.findOne({
      "emailVerification.code": code,
      "emailVerification.expireAt": { $gt: new Date() },
    });

    if (!user)
      return res
        .status(422)
        .json({ status: true, message: "Code expired or code is invalid" });

    // verify user
    user.isVerified = true;
    user.emailVerification.code = null;
    user.emailVerification.expireAt = null;
    await user.save();

    Logger.info("Email verification sucessful", { email: user.email });

    // get user profile
    const userProfile = await Profile.findOne({ userId: user._id });

    res.status(200).json({
      status: true,
      message: "Email verify sucessful",
      data: {
        ...userProfile.removeUnwantedFields(),
        isVerified: user.isVerified,
        id: user._id,
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
