import Env from "../config/index.js";
import jwt from "jsonwebtoken";
import AppError, { ErrorCodes } from "../errors/appError.js";
import User from "../models/user.model.js";

export default async function (req, res, next) {
  try {
    const accessToken = req.headers["authorization"]?.split(" ")[1].trim();
    if (!accessToken) {
      throw new AppError(
        ErrorCodes.UNAUTHENTICATED,
        "No token provided. Unauthenticated.",
        {
          status: 401,
          isOperational: true,
        },
      );
    }

    const tokenPayload = jwt.verify(accessToken, Env.TOKEN_SECRET_KEY);
    if (tokenPayload.type !== "accessToken") {
      throw new AppError(
        ErrorCodes.ACCESS_TOKEN_INVALID,
        "Invalid token. Unauthorized.",
        {
          status: 401,
          isOperational: true,
        },
      );
    }

    const authUser = await User.findOne({ _id: tokenPayload.id }).lean();
    if (!authUser) {
      throw new AppError(ErrorCodes.UNAUTHENTICATED, "Unauthenticated.", {
        status: 401,
        isOperational: true,
      });
    }

    req.user = { id: authUser._id, ...authUser };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AppError(
        ErrorCodes.ACCESS_TOKEN_EXPIRED,
        "Token expired. Please log in.",
        {
          status: 401,
          isOperational: true,
          cause: error,
        },
      );
    }

    if (error.name === "JsonWebTokenError") {
      throw new AppError(
        ErrorCodes.ACCESS_TOKEN_INVALID,
        "Invalid token. Unauthorized..",
        {
          status: 401,
          isOperational: true,
          cause: error,
        },
      );
    }

    next(error);
  }
}
