import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import Joi from "joi";
import { env } from "../config/index.js";
import { templates } from "../services/email.js";
import sendResendEmail from "../services/resend.js";
import AppError, { ErrorCodes } from "../errors/appError.js";
import * as authService from "../services/auth.service.js";
import Profile from "../models/profile.model.js";

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

function generateRandPassword(limit = 10) {
  const character = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[]|\:;"'<>,.?/~`;

  let randomPassword = "";
  for (let i = 0; i < limit; i++) {
    const index = Math.floor(Math.random() * character.length);
    randomPassword += character[index];
  }
  return randomPassword;
}

/*  Auto create user. In a case were user try checking out without creating an account, this middleware create a new account for them and send them an email with the default logins */
export default async function autoCreateUser(req, res, next) {
  try {
    const email = validateEmail(req.body);
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
      env.REFRESH_TOKEN_SECRET_KEY,
      { expiresIn: "30d" },
    );

    // Send email with default password so user can login
    sendResendEmail(
      email,
      "Welcome To True-Love App",
      templates.defaultPasswordTemplate("Cupid's chosen", email, password),
    );

    // For automatic login
    res.cookie("refreshToken", token, env.LOGIN_COOKIE_OPTS);

    req.user = newUser;
    next();
  } catch (error) {
    next(error);
  }
}
