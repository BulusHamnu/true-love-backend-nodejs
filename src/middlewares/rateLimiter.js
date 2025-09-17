import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { logger } from "../utils/helpers.js";

const getClientIp = (req) => {
  return req.headers?.["x-forwarded-for"]?.split(",")[0].trim() || req.ip;
};

const rateLimter = (time, limit, key) => {
  return rateLimit({
    windowMs: time,
    limit: limit,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn("Too many requests.", {
        route: req.originalUrl,
        identifier: req.user ? req.user?.email : req.ip,
      });
      res.status(403).json({
        status: false,
        message: "Too many request please try again later.",
      });
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
