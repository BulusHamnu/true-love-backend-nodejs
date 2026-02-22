import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import Logger from "../utils/logger.js";
import AppError, { ErrorCodes } from "../errors/appError.js";

/* Rate limiter middleware */
const getClientIdentifier = (req, res) => {
  if (req.user && req.user.id) {
    return String(req.user.id);
  }

  const forwardedIp = req.headers["x-forwarded-for"];
  if (forwardedIp) {
    Logger.info(`X-Forwarded-For: ${forwardedIp}`);
    const realClientIp = req.headers?.["x-forwarded-for"]?.split(",")[0].trim();
    return ipKeyGenerator(realClientIp);
  }

  return ipKeyGenerator(req.ip);
};

const rateLimter = (time, limit) => {
  return rateLimit({
    windowMs: time,
    limit: limit,
    legacyHeaders: false,
    handler: (req, res) => {
      Logger.warn("Too many requests.", {
        route: req.originalUrl,
        identifier: req.user ? String(req.user?.id) : req.ip,
      });

      throw new AppError(
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        "Too many request, please try again later.",
        403,
        true,
      );
    },
    keyGenerator: (req, res) => {
      return getClientIdentifier(req, res);
    },
  });
};

export default rateLimter;
