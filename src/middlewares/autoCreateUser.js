import User from "../models/user.model.js";
import Joi from "joi";
import Env from "../config/index.js";
import EmailTemplates from "../utils/emailTemplates.js";
import sendResendEmail from "../services/resend.js";
import * as authService from "../services/auth.service.js";
import Profile from "../models/profile.model.js";
import { generateRandPassword, signToken } from "../utils/helpers.js";
import validateAndSanitizeData from "../utils/validateAndSanitizeData.js";

/* Email validator */
function validateCheckoutBody(data) {
  const schema = Joi.object({
    email: Joi.string().required().email().label("email"),
  });
  return validateAndSanitizeData(data, schema);
}

/*  Auto create user. In a case were user try checking out without creating an account, this middleware create a new account for them and send them an email with the default logins.*/
export default async function autoCreateUser(req, res, next) {
  try {
    const { email } = validateCheckoutBody(req.body); // Even if a user already have an account the client should send the user email for verification in the middleware.

    const user = await User.findOne({ email }).lean();
    if (user) {
      req.user = {
        ...user,
        id: user._id,
      };

      return next();
    }

    const password = generateRandPassword();
    const newUser = await authService.createNewUser({
      email,
      fullName: "Cupid's chosen",
      password,
    });

    const refreshToken = signToken({
      email: newUser.email,
      id: newUser.id,
      type: "refreshToken",
    });

    // Send email with default password so user can login
    await sendResendEmail(
      email,
      "Welcome To True-Love App",
      EmailTemplates.defaultPasswordTemplate("Cupid's chosen", email, password),
    );

    // For automatic login
    res.cookie("refreshToken", refreshToken, Env.LOGIN_COOKIE_OPTS);
    req.user = newUser;
    next();
  } catch (error) {
    next(error);
  }
}
