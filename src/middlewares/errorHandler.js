import AppError, { ErrorCodes } from "../errors/appError.js";
import Logger from "../utils/logger.js";

/* Error handler */
const errorHandler = (err, req, res, next) => {
  Logger.error("An error ocurred.", err);
  if (err instanceof AppError) {
    return res.status(err.status).json({
      status: false,
      message: err.isOperational ? err.message : "An unexpected error occured.",
      error: {
        code: err.code,
        details: err.details,
      },
    });
  }

  res.status(500).json({
    status: false,
    message: "An unexpected error occured.",
    error: {
      code: ErrorCodes.UNEXPECTED_ERROR,
      details: null,
    },
  });
};

export default errorHandler;
