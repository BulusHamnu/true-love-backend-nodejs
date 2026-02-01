import express from "express";
import * as authRoutes from "../controllers/auth/auth.controller.js";
import withAuth from "../middlewares/withAuth.js";
import rateLimter from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/signup", rateLimter(5 * 60 * 1000, 5, "ip"), authRoutes.signup);

// google oauth2
router.get(
  "/google/signup",
  rateLimter(5 * 60 * 1000, 5, "ip"),
  authRoutes.getGoogleSignUpAuthUrl,
);
router.get(
  "/google/login",
  rateLimter(5 * 60 * 1000, 5, "ip"),
  authRoutes.getGoogleLoginAuthUrl,
);

router.get(
  "/google/signup-fallback",
  rateLimter(5 * 60 * 1000, 5, "ip"),
  authRoutes.signupWithGoogle,
);
router.get(
  "/google/login-fallback",
  rateLimter(5 * 60 * 1000, 5, "ip"),
  authRoutes.signinWithGoogle,
);
// ----

router.post("/login", rateLimter(5 * 60 * 1000, 5, "ip"), authRoutes.login);
router.post(
  "/refresh-token",
  rateLimter(5 * 60 * 1000, 10, "ip"),
  authRoutes.refreshToken,
);

router.post(
  "/logout",
  withAuth,
  rateLimter(5 * 60 * 1000, 5, "user-id"),
  authRoutes.logout,
);
router.post(
  "/resend-email",
  // withAuth,
  rateLimter(5 * 60 * 1000, 5, "user-id"),
  authRoutes.resendEmail,
);
router.post(
  "/reset-password",
  rateLimter(5 * 60 * 1000, 5, "ip"),
  authRoutes.resetPassword,
);
router.post(
  "/forget-password",
  rateLimter(5 * 60 * 1000, 5, "ip"),
  authRoutes.forgetPassword,
);
router.post(
  "/verify-email",
  rateLimter(5 * 60 * 1000, 5, "ip"),
  authRoutes.verifyEmail,
);
router.post(
  "/verify-password-reset-code",
  rateLimter(5 * 60 * 1000, 5, "ip"),
  authRoutes.verifyPasswordResetCode,
);

export default router;
