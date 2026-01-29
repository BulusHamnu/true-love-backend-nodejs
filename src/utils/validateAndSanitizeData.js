import AppError from "../errors/appError.js";
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
    throw new AppError(
      "VALIDATION_ERROR",
      "Validation failed.",
      400,
      true,
      details,
    );
  }

  return sanitizeData(value);
}
