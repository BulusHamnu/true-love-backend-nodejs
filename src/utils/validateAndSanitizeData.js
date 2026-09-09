import AppError, { ErrorCodes } from "../errors/appError.js";
import sanitizeData from "./sanitizeData.js";

export default function validateAndSanitizeData(data, schema) {
  const { value, error } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = {};
    for (const err of error.details) {
      const errField = err.path[0];
      details[errField] = err.message;
    }
    
    throw new AppError(ErrorCodes.VALIDATION_ERROR, "Validation failed.", {
      status: 400,
      isOperational: true,
      details,
    });
  }

  return sanitizeData(value);
}
