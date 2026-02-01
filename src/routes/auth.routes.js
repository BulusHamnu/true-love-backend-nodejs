import express from "express";
import * as authController from "../controllers/auth/auth.controller.js";
import withAuth from "../middlewares/withAuth.js";
import rateLimter from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post(
  "/signup",
  rateLimter(5 * 60 * 1000, 5, "ip"),
  authController.signup,
);

router.post("/login", rateLimter(5 * 60 * 1000, 5, "ip"), authController.login);
router.post(
  "/refresh-token",
  rateLimter(5 * 60 * 1000, 10, "ip"),
  authController.refreshToken,
);

router.post(
  "/logout",
  withAuth,
  rateLimter(5 * 60 * 1000, 5, "user-id"),
  authController.logout,
);
router.post(
  "/resend-email",
  // withAuth,
  rateLimter(5 * 60 * 1000, 5, "user-id"),
  authController.resendEmail,
);
router.post(
  "/reset-password",
  rateLimter(5 * 60 * 1000, 5, "ip"),
  authController.resetPassword,
);
router.post(
  "/forget-password",
  rateLimter(5 * 60 * 1000, 5, "ip"),
  authController.forgetPassword,
);
router.post(
  "/verify-email",
  rateLimter(5 * 60 * 1000, 5, "ip"),
  authController.verifyEmail,
);
router.post(
  "/verify-password-reset-code",
  rateLimter(5 * 60 * 1000, 5, "ip"),
  authController.verifyPasswordResetCode,
);

/* Google Oauth */
router.get(
  "/google/signup",
  rateLimter(5 * 60 * 1000, 5, "ip"),
  authController.getGoogleSignUpAuthUrl,
);
router.get(
  "/google/login",
  rateLimter(5 * 60 * 1000, 5, "ip"),
  authController.getGoogleLoginAuthUrl,
);

router.get(
  "/google/signup-fallback",
  rateLimter(5 * 60 * 1000, 5, "ip"),
  authController.signupWithGoogle,
);
router.get(
  "/google/login-fallback",
  rateLimter(5 * 60 * 1000, 5, "ip"),
  authController.signinWithGoogle,
);

export default router;
