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

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", withAuth, logout);
router.post("/resend-email", withAuth, resendEmail);
router.post("/reset-password", resetPassword);
router.post("/forget-password", forgetPassword);
router.post("/verify-email", verifyEmail);
router.post("/verify-password-reset-code", verifyPasswordResetCode);

export default router;
