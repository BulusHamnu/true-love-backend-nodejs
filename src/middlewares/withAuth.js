import Logger from "../utils/logger.js";
import Env from "../config/index.js";
import jwt from "jsonwebtoken";
import AppError, { ErrorCodes } from "../errors/appError.js";

export default async function (req, res, next) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      throw new AppError(
        ErrorCodes.UNAUTHORIZED,
        "No token provided. Unauthorized.",
        401,
        true,
      );
    }

    const user = jwt.verify(token, Env.SECRET_KEY);
    req.user = user;

    next();
  } catch (error) {
    Logger.error(error);

    if (error.name === "TokenExpiredError") {
      throw new AppError(
        ErrorCodes.AUTH_TOKEN_EXPIRED,
        "Token expired. Please log in again.",
        401,
        true,
      );
    }

    if (error.name === "JsonWebTokenError") {
      throw new AppError(
        ErrorCodes.AUTH_TOKEN_INVALID,
        "Token expired. Please log in again.",
        401,
        true,
      );
    }

    next(error);
  }
}
