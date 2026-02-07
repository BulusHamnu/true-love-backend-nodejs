import AppError, { ErrorCodes } from "../errors/appError.js";

/* For checking if user email is verified */
export default function requiredVerifiedEmail(req, res, next) {
  const user = req.user;
  if (!user) {
    return next(
      new AppError(ErrorCodes.UNAUTHENTICATED, "Not authenticated", 401, true),
    );
  }

  if (!user.isVerified) {
    return next(
      new AppError(
        ErrorCodes.EMAIL_NOT_VERIFIED,
        "Email not verified.",
        403,
        true,
      ),
    );
  }

  next();
}
