import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import Joi from "joi";
import Env from "../config/index.js";
import EmailTemplates from "../utils/emailTemplates.js";
import sendResendEmail from "../services/resend.js";
import AppError, { ErrorCodes } from "../errors/appError.js";
import * as authService from "../services/auth.service.js";
import Profile from "../models/profile.model.js";
import { generateRandPassword } from "../utils/helpers.js";

/* Email validator */
function validateEmail(body) {
  const validator = Joi.string().required().email().label("email");
  const { value, error } = validator.validate(body.email);
  if (error) {
    throw new AppError(
      ErrorCodes.VALIDATION_ERROR,
      "Validation failed",
      400,
      true,
      {
        email: error.message,
      },
    );
  }
  return value;
}

/*  Auto create user. In a case were user try checking out without creating an account, this middleware create a new account for them and send them an email with the default logins.*/
export default async function autoCreateUser(req, res, next) {
  try {
    const email = validateEmail(req.body); // Even if a user already have an account the client should send the user email for verification in the middleware.

    const user = await User.findOne({ email }).lean();
    if (user) {
      const userProfile = await Profile.findOne({ userId: user._id }).lean();
      req.user = { ...user, id: user._id, ...userProfile };
      return next();
    }

    const password = generateRandPassword();
    const newUser = await authService.createNewUser({
      email,
      fullName: "Cupid's chosen",
      password,
    });

    const token = jwt.sign(
      { email, id: newUser._id, isVerified: newUser.isVerified },
      Env.REFRESH_TOKEN_SECRET_KEY,
      { expiresIn: "7d" },
    );

    // Send email with default password so user can login
    await sendResendEmail(
      email,
      "Welcome To True-Love App",
      EmailTemplates.defaultPasswordTemplate("Cupid's chosen", email, password),
    );

    // For automatic login
    res.cookie("refreshToken", token, Env.LOGIN_COOKIE_OPTS);

    req.user = newUser;
    next();
  } catch (error) {
    next(error);
  }
}
