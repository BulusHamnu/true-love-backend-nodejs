import express from "express";
import {
  signup,
  login,
  logout,
  resendEmail,
  resetPassword,
  forgetPassword,
  verifyEmail,
  verifyPasswordResetCode,
} from "../controllers/auth/authControllers.js";
import withAuth from "../middlewares/withAuth.js";
import rateLimter from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/signup", rateLimter(5 * 60 * 1000, 5, "ip"), signup);
router.post("/login", rateLimter(5 * 60 * 1000, 5, "ip"), login);
router.post(
  "/logout",
  withAuth,
  rateLimter(5 * 60 * 1000, 5, "user-id"),
  logout
);
router.post(
  "/resend-email",
  withAuth,
  rateLimter(5 * 60 * 1000, 5, "user-id"),
  resendEmail
);
router.post(
  "/reset-password",
  rateLimter(5 * 60 * 1000, 5, "ip"),
  resetPassword
);
router.post(
  "/forget-password",
  rateLimter(5 * 60 * 1000, 5, "ip"),
  forgetPassword
);
router.post("/verify-email", rateLimter(5 * 60 * 1000, 5, "ip"), verifyEmail);
router.post(
  "/verify-password-reset-code",
  rateLimter(5 * 60 * 1000, 5, "ip"),
  verifyPasswordResetCode
);

export default router;
