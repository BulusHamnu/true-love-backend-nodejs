import User from "../models/user.model.js";
import Joi from "joi";
import Env from "../config/index.js";
import * as authService from "../services/auth.service.js";
import { generateRandPassword, signToken } from "../utils/helpers.js";
import validateAndSanitizeData from "../utils/validateAndSanitizeData.js";
import { ErrorCodes } from "../errors/appError.js";
import mainQueue from "../queues/main.queue.js";

/* Email validator */
function validateBody(data) {
  const schema = Joi.object({
    email: Joi.string().required().email().label("email"),
  });
  return validateAndSanitizeData(data, schema);
}

/*  Auto create user. In a case were user try checking out without creating an account, this middleware create a new account for them and send them an email with the default logins.*/
export default async function autoCreateUser(req, res, next) {
  const email = req.body.email;
  try {
    const { email } = validateBody(req.body); // Even if a user already have an account the client should send the user email for verification when making payment.

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
    await mainQueue.add(
      "default-password-welcome-email",
      {
        email: newUser.email,
        subject: "Welcome To True-Love App",
        defaultPassword: password,
      },
      {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: "fixed",
          delay: 3000,
        },
      },
    );

    // For automatic login
    res.cookie("refreshToken", refreshToken, Env.LOGIN_COOKIE_OPTS);
    req.user = newUser;

    next();
  } catch (error) {
    const userAlreadyExists =
      error.code == ErrorCodes.USER_ALREADY_EXISTS || error.code === 11000;

    if (userAlreadyExists) {
      // No need to create new user if they already exists.
      const user = await User.findOne({ email }).lean();
      req.user = {
        ...user,
        id: user._id,
      };

      return next();
    }
    next(error);
  }
}
