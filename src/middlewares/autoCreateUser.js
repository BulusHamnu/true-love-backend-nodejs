import { generateCode, hashPassword, logger } from "../utils/helpers.js";
import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import jwt from "jsonwebtoken";
import Joi from "joi";
import { env } from "../config/index.js";
import { templates } from "../services/email.js";
import sendResendEmail from "../services/resend.js";

export default async function autoCreateUser(req, res, next) {
  try {
    const { email } = req.body;
    const validator = Joi.string().required().email().label("email");
    const validate = validator.validate(email);
    if (validate.error) {
      res.status(400).json({
        status: false,
        message: validate.error.message,
      });
    }

    const userProfile = await Profile.findOne({ email: email });
    if (userProfile) {
      req.userProfile = userProfile;
      return next();
    }

    const password = generateCode(10);
    const defaultPassword = await hashPassword(password);

    // create new user
    const newUser = await User.create({
      password: defaultPassword,
      email,
    });

    // create a profile for that user
    const newUserProfile = await Profile.create({
      userId: newUser._id,
      fullName: "Not provided",
      // phone: "000000000000",
      // age: 0,
      email,
    });

    logger.info("New user created", { email: newUserProfile.email });

    // generate token: no refresh token, just token and save in cookies
    const token = jwt.sign(
      { email, id: newUser._id, isVerified: newUser.isVerified },
      env.SECRET_KEY,
      { expiresIn: "30d" },
    );

    // send verfication email
    sendResendEmail(
      email,
      "Welcome To True-Love App",
      templates.defaultPasswordTemplate("Cupid's chosen", email, password),
    );

    // set res cookies for 30d
    res.cookie("token", token, {
      secure: process.env.PRODUCTION === "True",
      httpOnly: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 30,
    });

    req.userProfile = newUserProfile;
    next();
  } catch (error) {
    logger.error(error);
    return { status: false, newUserProfile: null, loginToken: null };
  }
}
