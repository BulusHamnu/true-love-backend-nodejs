import Logger from "../utils/logger.js";
import Env from "../config/index.js";
import jwt from "jsonwebtoken";

export default async function (req, res, next) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      Logger.info("Token not provided.");
      return res.status(401).json({
        status: false,
        message: "No token provided. Unauthorized.",
      });
    }

    const user = jwt.verify(token, Env.SECRET_KEY);
    req.user = user;
    // call the route handler
    next();
  } catch (error) {
    Logger.error(error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: false,
        message: "Token expired. Please log in again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: false,
        message: "Invalid token. Unauthorized.",
      });
    }

    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
    });
  }
}
