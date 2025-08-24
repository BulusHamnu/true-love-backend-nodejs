import { logInfo, logError } from "../utils/helpers.js";
import { env } from "../../confiq/index.js";
import jwt from "jsonwebtoken";

export default async function (req, res, next) {
  try {
    const token = req.cookies.token;

    const user = jwt.decode(token, env.SECRET_KEY);
    if (!user)
      return res.status(401).json({
        status: false,
        message: "Invalid or expired token. Unauthorized.",
      });
    req.user = user;
    // call the route handler
    next();
  } catch (error) {
    logError("An error while decoding data", error.message);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
      error: error.message,
    });
  }
}
