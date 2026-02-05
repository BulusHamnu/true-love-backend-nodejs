import { generateCode } from "../../utils/helpers.js";
import User from "../../models/user.model.js";
import Profile from "../../models/profile.model.js";
import sendResendEmail from "../../services/resend.js";
import EmailTemplates from "../../utils/emailTemplates.js";
import Env from "../../config/index.js";
import * as authValidator from "../../utils/validators.js";
import Joi from "joi";
import sanitizeData from "../../utils/sanitizeData.js";
import * as authService from "../../services/auth.service.js";
import validateAndSanitizeData from "../../utils/validateAndSanitizeData.js";
import Logger from "../../utils/logger.js";
import bcrypt from "bcryptjs";

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

// forget password handler
export async function forgetPassword(req, res) {
  try {
    const { email } = req.body;

    // validate email with Joi
    const validator = Joi.string().email().required().label("email");
    const validate = validator.validate(email);
    if (validate.error)
      return res
        .status(400)
        .json({ status: false, message: validate.error.message });

    // check if user already exist
    const user = await User.findOne({ email: email });
    if (!user)
      return res
        .status(404)
        .json({ status: true, message: "User does not exist." });

    Logger.info("Password reset requested", { email });

    // generate verification code
    const verficationCode = generateCode(6);

    // update user
    user.resetPasswordVerification.code = verficationCode;
    user.resetPasswordVerification.expireAt = new Date(
      Date.now() + 15 * 60 * 1000,
    );
    await user.save();

    // send verfication email
    await sendResendEmail(
      email,
      "Reset Your Password",
      EmailTemplates.passwordVerificationTemplate(verficationCode),
    );

    res.status(200).json({
      status: true,
      message: "Password reset email was sent sucessfully.",
    });
  } catch (error) {
    Logger.error(error);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
    });
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

// reset password handler
export async function resetPassword(req, res) {
  try {
    const cleanData = sanitizeData(req.body);
    const { email, password } = cleanData;

    const validate = authValidator.emailAndPasswordSchema.validate({
      email,
      password,
    });

    if (validate.error)
      return res
        .status(400)
        .json({ status: false, message: validate.error.message });

    // check if user already exist
    const user = await User.findOne({ email: email });
    if (!user)
      return res
        .status(404)
        .json({ status: true, message: "User does not exist." });

    // check if code still exist
    if (!user.resetPasswordVerification.code)
      return res.status(404).json({ status: false, message: "Code not found" });

    // hash user password
    const newPassword = await bcrypt.hash(password, Env.PASSWORD_HASH_SALT);

    // update password
    user.resetPasswordVerification.code = null;
    user.resetPasswordVerification.expireAt = null;
    user.password = newPassword;
    await user.save();

    Logger.info("User password reset sucessful", {
      email: user.email,
    });

    // send verfication email
    await sendResendEmail(
      email,
      "Password reset sucessfully.",
      EmailTemplates.paswordResetSucessful(user.fullName),
    );

    res.status(200).json({
      status: true,
      message: "Password was reset sucessfully.",
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

// verify password reset code handler
export async function verifyPasswordResetCode(req, res) {
  try {
    const { code } = req.body;
    if (!code)
      return res.status(400).json({
        status: false,
        message: "Please provide verification code.",
      });

    // check if user already exist
    const user = await User.findOne({
      "resetPasswordVerification.code": code,
      "resetPasswordVerification.expireAt": { $gt: new Date() },
    });

    if (!user)
      return res
        .status(422)
        .json({ status: false, message: "Code expired or code is invalid" });

    res.status(200).json({
      status: true,
      message: "Code is valid",
    });
  } catch (error) {
    Logger.error(error);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
    });
  }
}
