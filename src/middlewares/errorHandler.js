import AppError from "../errors/appError.js";
import { logger } from "../utils/helpers.js";

/* Error handler */
const errorHandler = (err, req, res, next) => {
  logger.error("An error ocurred.", err);
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
      code: "UNEXPECTED_ERROR",
      details: null,
    },
  });
};

export default errorHandler;
