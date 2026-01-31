import { generateCode } from "../../utils/helpers.js";
import User from "../../models/user.model.js";
import Profile from "../../models/profile.model.js";
import sendResendEmail from "../../services/resend.js";
import EmailTemplates from "../../utils/emailTemplates.js";
import Env from "../../config/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as authValidator from "../../utils/validators.js";
import Joi from "joi";
import sanitizeData from "../../utils/sanitizeData.js";
import * as authService from "../../services/auth.service.js";
import retriveGoogleIdToken from "../../services/retriveGoogleIdToken.js";
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

// get google oauthurl for signup
export async function getGoogleSignUpAuthUrl(req, res) {
  try {
    Logger.info("New user request for google oauth url.");
    const oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth?";

    const params = new URLSearchParams({
      client_id: Env.TRUE_LOVE_GOOGLE_CLIENT_ID,
      redirect_uri: `${Env.BACKEND_URL}/api/auth/google/signup-fallback`,
      response_type: "code",
      scope: "openid profile email",
      state: "pass-through value",
      include_granted_scopes: "true",
    });

    const redirectLink = oauth2Endpoint + params.toString();

    res.status(200).json({
      status: true,
      message: "Google Oauth2 url retrive successful.",
      redirectLink,
    });
  } catch (error) {
    Logger.error(error);
    res
      .status(500)
      .json({ status: false, message: "Unexpected error occured." });
  }
}

// sign up with google handler
export async function signupWithGoogle(req, res) {
  try {
    const accessCode = req.query.code; // get google code
    if (!accessCode) return res.redirect(`${Env.FRONTEND_URL}/auth`);

    // add retry here
    const payload = await retriveGoogleIdToken(
      accessCode,
      "/api/auth/google/signup-fallback",
    );

    if (!payload) return res.redirect(`${Env.FRONTEND_URL}/auth`);

    // check if user already exist
    const userExist = await User.findOne({ email: payload.email });
    if (userExist) {
      if (userExist.provider === "local")
        return res.redirect(`${Env.FRONTEND_URL}/auth?error=email_taken`);
      return res.redirect(`${Env.FRONTEND_URL}/auth?error=google_user_exist`);
    }

    // fake user password hash
    const userPassword = await hashPassword("null");

    // create user
    const { error, newUser } = await createNewUser({
      provider: "google",
      password: userPassword,
      email: payload.email,
      fullName: payload.name,
      googleId: payload.sub,
      idToken: payload.idToken,
      isVerified: payload.email_verified,
    });

    if (error) throw new Error("An error occured while creating a new user.");

    // send welcome email
    /* await sendResendEmail(
      email,
      "Please verify your email address",
      EmailTemplates.emailVerificationTemplate(fullName, verficationCode)
    ); */

    const token = jwt.sign(
      { email: newUser.email, id: newUser.id, isVerified: newUser.isVerified },
      Env.SECRET_KEY,
      { expiresIn: "30d" },
    );

    // set res cookies for 30d
    res.cookie("token", token, Env.LOGIN_COOKIE_OPTS);

    Logger.info("User login after google signup.", { email: newUser.email });

    res.redirect(Env.FRONTEND_URL);
  } catch (error) {
    Logger.error(error);
    res.redirect(`${Env.FRONTEND_URL}/auth`);
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

    // check if password is correct and also checj if auth is local or google
    if (!passwordCorrect) {
      if (user.provider === "google")
        return res.status(401).json({
          status: false,
          message:
            "This account was created with Google. Please login with Google or reset your password to enable email login.",
        });

      return res
        .status(401)
        .json({ status: false, message: "Incorect password" });
    }

    // generate token: no refresh token, just token and save in cookies
    const token = jwt.sign(
      { email: user.email, id: user._id, isVerified: user.isVerified },
      Env.SECRET_KEY,
      { expiresIn: "30d" },
    );

    // set res cookies for 30d
    res.cookie("token", token, Env.LOGIN_COOKIE_OPTS);

    Logger.info("User login successful", { email: user.email });

    res.status(200).json({
      status: true,
      message: "Login sucessful, token is set in the cookie header.",
    });
  } catch (error) {
    Logger.error(error);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
    });
  }
}

// get google oauthurl for login
export async function getGoogleLoginAuthUrl(req, res) {
  try {
    const oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth?";
    Logger.info("User request for google sign in oauth url.");

    const params = new URLSearchParams({
      client_id: Env.TRUE_LOVE_GOOGLE_CLIENT_ID,
      redirect_uri: `${Env.BACKEND_URL}/api/auth/google/login-fallback`,
      response_type: "code",
      scope: "openid profile email",
      state: "pass-through value",
      include_granted_scopes: "true",
    });

    const redirectLink = oauth2Endpoint + params.toString();

    res.status(200).json({
      status: true,
      message: "Google sign in Oauth2 url retrive successful.",
      redirectLink,
    });
  } catch (error) {
    Logger.error(error);
    res
      .status(500)
      .json({ status: false, message: "Unexpected error occured." });
  }
}

// sign in with google handler
export async function signinWithGoogle(req, res) {
  try {
    const accessCode = req.query.code; // get google code
    if (!accessCode) return res.redirect(`${Env.FRONTEND_URL}/auth`);

    // add retry here
    const payload = await retriveGoogleIdToken(
      accessCode,
      "/api/auth/google/login-fallback",
    );

    if (!payload) return res.redirect(`${Env.FRONTEND_URL}/auth`);

    // check if user already exist
    const userExist = await User.findOne({ email: payload.email });
    if (!userExist || userExist.provider != "google")
      return res.redirect(`${Env.FRONTEND_URL}/auth?error=google_not_link`);

    const token = jwt.sign(
      {
        email: userExist.email,
        id: userExist._id,
        isVerified: userExist.isVerified,
      },
      Env.SECRET_KEY,
      { expiresIn: "30d" },
    );

    // set res cookies for 30d
    res.cookie("token", token, Env.LOGIN_COOKIE_OPTS);

    Logger.info("User login with google oauth2.", { email: userExist.email });

    res.redirect(Env.FRONTEND_URL);
  } catch (error) {
    Logger.error(error);
    res.redirect(`${Env.FRONTEND_URL}/auth`);
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

// logout handler
export async function logout(req, res) {
  try {
    if (!req.user?.email) return res.status(401).end();

    // delete token cookies
    res.cookie("token", "", {
      secure: process.Env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "none",
      maxAge: 0,
    });

    res.status(200).json({
      status: true,
      message: "User logout sucessfully",
    });
  } catch (error) {
    Logger.error(error);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
    });
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
