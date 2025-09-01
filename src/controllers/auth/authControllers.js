import {
  logInfo,
  logError,
  hashPassword,
  generateCode,
} from "../../utils/helpers.js";
import User from "../../models/user.js";
import Profile from "../../models/profile.js";
import sendResendEmail from "../../services/resend.js";
import { templates, sendEmail } from "../../services/email.js";
import { env } from "../../../confiq/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  emailAndPasswordSchema,
  signupSchema,
} from "../../utils/validators.js";
import Joi from "joi";
import sanitizeData from "../../utils/sanitizeData.js";

// sign up handler
export async function signup(req, res) {
  try {
    // validate body data
    const cleanData = sanitizeData(req.body);
    const { fullName, phone, age, password, email } = cleanData;
    const validate = signupSchema.validate({
      fullName,
      phone,
      age,
      password,
      email,
    });

    if (validate.error)
      return res.status(400).json({
        status: false,
        message: validate.error.message,
      });

    // check if user already exist
    const userExist = await User.findOne({ email: email });
    if (userExist)
      return res
        .status(409)
        .json({ status: false, message: "User already exist." });

    // hash user password
    const userPassword = await hashPassword(password);
    const verficationCode = generateCode(6);

    // create new user
    const newUser = await User.create({
      password: userPassword,
      email,
      emailVerification: {
        code: verficationCode,
        expireAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    // create a profile for that user
    const userProfile = await Profile.create({
      userId: newUser._id,
      fullName,
      phone,
      age,
      email,
    });

    // send verfication email
    await sendResendEmail(
      email,
      "Please verify your email address",
      templates.emailVerificationTemplate(fullName, verficationCode)
    );

    res.status(201).json({
      status: true,
      message: "User created sucessfully.",
      data: userProfile,
    });
  } catch (error) {
    logError("An error occur while signing up", error.message);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
      error: error.message,
    });
  }
}

// login handler
export async function login(req, res) {
  try {
    const { password, email } = req.body;
    const validator = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });
    const validate = validator.validate({
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
        .json({ status: false, message: "User does not exist." });

    // compare password
    const passwordCorrect = await bcrypt.compare(password, user.password);
    if (!passwordCorrect)
      return res
        .status(400)
        .json({ status: false, message: "Incorect password" });

    // generate token: no refresh token, just token and save in cookies
    const token = jwt.sign(
      { email: user.email, id: user._id, isVerified: user.isVerified },
      env.SECRET_KEY,
      { expiresIn: "30d" }
    );

    // set res cookies for 30d
    res.cookie("token", token, {
      secure: process.env.PRODUCTION === "True",
      httpOnly: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 30,
    });

    res.status(200).json({
      status: true,
      message: "Login sucessful, token is set in the cookie header.",
    });
  } catch (error) {
    logError("An error while verifying data", error.message);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
      error: error.message,
    });
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

    // generate verification code
    const verficationCode = generateCode(6);

    // update user
    user.resetPasswordVerification.code = verficationCode;
    user.resetPasswordVerification.expireAt = new Date(
      Date.now() + 15 * 60 * 1000
    );
    await user.save();

    // send verfication email
    await sendResendEmail(
      email,
      "Reset Your Password",
      templates.passwordVerificationTemplate("", verficationCode)
    );

    res.status(200).json({
      status: true,
      message: "Password reset email was sent sucessfully.",
    });
  } catch (error) {
    logError("An error occur while sending code", error.message);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
      error: error.message,
    });
  }
}

// logout handler
export async function logout(req, res) {
  try {
    if (!req.user?.email) return res.status(400).end();

    // delete token cookies
    res.cookie("token", "", {
      secure: process.env.PRODUCTION === "True",
      httpOnly: true,
      sameSite: "none",
      maxAge: 0,
    });

    res.status(200).json({
      status: true,
      message: "User logout sucessfully",
    });
  } catch (error) {
    logError("An error occur while trying to log user out", error.message);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
      error: error.message,
    });
  }
}

// resend email handler
export async function resendEmail(req, res) {
  try {
    // check if user exist
    const user = await User.findOne({ email: req.user.email });
    if (!user)
      return res
        .status(400)
        .json({ status: true, message: "User does not exist." });

    // check if user is already verfied
    if (user.isVerified)
      return res.status(400).json({
        status: false,
        message: "User is already verified",
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
      templates.emailVerificationTemplate(user.fullName, verficationCode)
    );

    res.status(200).json({
      status: true,
      message: "Email was sent sucessfully.",
    });
  } catch (error) {
    logError("An error while resending email", error.message);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
      error: error.message,
    });
  }
}

// reset password handler
export async function resetPassword(req, res) {
  try {
    const cleanData = sanitizeData(req.body);
    const { email, password } = cleanData;

    const validate = emailAndPasswordSchema.validate({
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
    const newPassword = await hashPassword(password);

    // update password
    user.resetPasswordVerification.code = null;
    user.resetPasswordVerification.expireAt = null;
    user.password = newPassword;
    await user.save();

    // send verfication email
    await sendResendEmail(
      email,
      "Password reset sucessfully.",
      templates.paswordResetSucessful()
    );

    res.status(200).json({
      status: true,
      message: "Password was reset sucessfully.",
    });
  } catch (error) {
    logError("An error occur while reseting password", error.message);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
      error: error.message,
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
        .status(400)
        .json({ status: true, message: "Code expired or code is invalid" });

    // verify user
    user.isVerified = true;
    user.emailVerification.code = null;
    user.emailVerification.expireAt = null;
    await user.save();

    // get user profile
    const userProfile = await Profile.findOne({ userId: user._id });

    res.status(200).json({
      status: true,
      message: "Email verify sucessful",
      data: {
        ...userProfile.toObject(),
        isVerified: true,
      },
    });
  } catch (error) {
    logError("An error occur while verifying email", error.message);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
      error: error.message,
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
        .status(400)
        .json({ status: false, message: "Code expired or code is invalid" });

    res.status(200).json({
      status: true,
      message: "Code is valid",
    });
  } catch (error) {
    logError("An error occur verifying code.", error.message);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
      error: error.message,
    });
  }
}
