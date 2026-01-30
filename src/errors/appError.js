/* Errro Codes */
export const ErrorCodes = {
  USER_NOT_FOUND: "USER_NOT_FOUND",
  PROFILE_NOT_FOUND: "PROFILE_NOT_FOUND",
  USER_ALREADY_EXIST: "USER_ALREADY_EXIST",

  EMAIL_DELIVERY_FAILED: "EMAIL_DELIVERY_FAILED",

  SELFGUIDED_ALREADY_PURCHASED: "SELFGUIDED_ALREADY_PURCHASED",
  COACHING_ALREADY_PURCHASED: "COACHING_ALREADY_PURCHASED",
  STRIPE_COUPON_INVALID: "STRIPE_COUPON_INVALID",

  VALIDATION_ERROR: "VALIDATION_ERROR",
};

/* App custom error */
class AppError extends Error {
  constructor(code, message, status, isOperational, details = null) {
    super(message);
    ((this.code = code),
      (this.message = message),
      (this.status = Number(status)),
      (this.isOperational = isOperational),
      (this.details = details),
      (this.name = this.constructor.name));

    Error.captureStackTrace(this, this.contructor);
  }
}

export default AppError;
