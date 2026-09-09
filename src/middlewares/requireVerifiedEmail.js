import AppError, { ErrorCodes } from "../errors/appError.js";

/* For checking if user email is verified */
export default function requiredVerifiedEmail(req, res, next) {
  const user = req.user;
  if (!user) {
    return next(
      new AppError(ErrorCodes.UNAUTHENTICATED, "Not authenticated", {
        status: 401,
        isOperational: true,
      }),
    );
  }

  if (!user.isVerified) {
    return next(
      new AppError(
        ErrorCodes.EMAIL_NOT_VERIFIED,
        "Email not verified.",
        {
          status: 403,
          isOperational: true,
        },
      ),
    );
  }

  next();
}
