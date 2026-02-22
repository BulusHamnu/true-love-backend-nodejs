import express from "express";
import * as authController from "../controllers/auth/auth.controller.js";
import * as googleAuthController from "../controllers/auth/googleOauth.controller.js";
import withAuth from "../middlewares/withAuth.js";
import rateLimter from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/signup", rateLimter(5 * 60 * 1000, 5), authController.signup);
router.post("/login", rateLimter(5 * 60 * 1000, 5), authController.login);

router.post(
  "/refresh-token",
  rateLimter(5 * 60 * 1000, 10),
  authController.refreshToken,
);

router.post(
  "/logout",
  withAuth,
  rateLimter(5 * 60 * 1000, 5),
  authController.logout,
);

router.post(
  "/verify-email",
  rateLimter(5 * 60 * 1000, 5),
  authController.verifyEmail,
);
router.post(
  "/resend-email",
  withAuth,
  rateLimter(5 * 60 * 1000, 5),
  authController.resendEmaiVerificationCode,
);
router.post(
  "/verify-password-reset-otp",
  rateLimter(5 * 60 * 1000, 5),
  authController.verifyPasswordResetOpt,
);
router.post(
  "/forget-password",
  rateLimter(5 * 60 * 1000, 5),
  authController.forgetPassword,
);
router.post(
  "/reset-password",
  rateLimter(5 * 60 * 1000, 5),
  authController.resetPassword,
);

/* Google Oauth routes*/
router.get(
  "/google",
  rateLimter(5 * 60 * 1000, 5),
  googleAuthController.retriveGoogleOauthUrl,
);

router.get("/google/callback", googleAuthController.googleCallbackHandler);

export default router;
