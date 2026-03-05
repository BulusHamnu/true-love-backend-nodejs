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
function validateCodeBody(data) {
  const schema = Joi.object({
    code: Joi.string().required().length(6),
    email: authValidator.emailField,
  });
  return validateAndSanitizeData(data, schema);
}

export async function verifyPasswordResetOpt(req, res, next) {
  try {
    const { code, email } = validateCodeBody(req.body);
    const resetToken = await authService.verifyOptCodeAndIssueToken(
      code,
      email,
    );

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
    const { password, resetToken, email } = validateAndSanitizeData(
      req.body,
      authValidator.resetPasswordBodySchema,
    );

    await authService.resetPassword(email, password, resetToken);

    res.status(200).json({
      status: true,
      message: "Password was reset sucessfully.",
    });
  } catch (error) {
    next(error);
  }
}

/* Resend email verification code handler */
export async function resendEmaiVerificationCode(req, res, next) {
  try {
    const user = req.user;
    Logger.info(`${user.email} requested for email verification`);

    await authService.sendEmailVerificationCode(user);

    res.status(200).json({
      status: true,
      message: "Email was sent sucessfully.",
    });
  } catch (error) {
    next(error);
  }
}

/* Verify email code handler */
export async function verifyEmail(req, res, next) {
  try {
    const { code } = validateCodeBody(req.body);
    await authService.verifyEmailVerificationCode(code);

    res.status(200).json({
      status: true,
      message: "Email verification was successful.",
    });
  } catch (error) {
    next(error);
  }
}
