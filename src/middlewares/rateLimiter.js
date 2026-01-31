import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import Logger from "../utils/logger.js";
import AppError, { ErrorCodes } from "../errors/appError.js";

const getClientIp = (req) => {
  const forwardedIp = req.headers["x-forwarded-for"];
  if (forwardedIp) {
    Logger.info(`X-Forwarded-For: ${forwardedIp}`);
    return req.headers?.["x-forwarded-for"]?.split(",")[0].trim();
  }

  return req.ip;
};

const rateLimter = (time, limit, key) => {
  return rateLimit({
    windowMs: time,
    limit: limit,
    legacyHeaders: false,
    handler: (req, res) => {
      Logger.warn("Too many requests.", {
        route: req.originalUrl,
        identifier: req.user ? req.user?.email : req.ip,
      });

      throw new AppError(
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        "Too many request, please try again later.",
        403,
        true,
      );
    },
    keyGenerator: (req, res) => {
      if (key === "user-id" && req.user && req.user.id) {
        return req.user.id;
      }

      return ipKeyGenerator(getClientIp(req));
    },
  });
};

export default rateLimter;
