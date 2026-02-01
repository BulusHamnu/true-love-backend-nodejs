import Env from "../config/index.js";
import jwt from "jsonwebtoken";
import AppError, { ErrorCodes } from "../errors/appError.js";

export default async function (req, res, next) {
  try {
    const accessToken = req.headers["authorization"]?.split(" ")[1].trim();
    if (!accessToken) {
      throw new AppError(
        ErrorCodes.UNAUTHORIZED,
        "No token provided. Unauthorized.",
        401,
        true,
      );
    }

    const tokenPayload = jwt.verify(accessToken, Env.TOKEN_SECRET_KEY);
    if (tokenPayload.type !== "accessToken") {
      throw new AppError(
        ErrorCodes.ACCESS_TOKEN_INVALID,
        "Invalid token. Unauthorized.",
        401,
        true,
      );
    }

    req.user = tokenPayload;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AppError(
        ErrorCodes.ACCESS_TOKEN_EXPIRED,
        "Token expired. Please log in.",
        401,
        true,
      );
    }

    if (error.name === "JsonWebTokenError") {
      throw new AppError(
        ErrorCodes.ACCESS_TOKEN_INVALID,
        "Invalid token. Unauthorized..",
        401,
        true,
      );
    }

    next(error);
  }
}
