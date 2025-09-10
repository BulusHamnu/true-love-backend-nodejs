import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { logger } from "../utils/helpers.js";

const rateLimter = (time, limit, key) => {
  return rateLimit({
    windowMs: time,
    limit: limit,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn("Too many requests.", {
        route: req.originalUrl,
        identifier: res.user ? res.user?.email : req.ip,
      });
      res.status(403).json({
        status: false,
        message: "Too many request please try again later.",
      });
    },
    keyGenerator: (req, res) => {
      if (key === "user-id" && res.user && res.user.id) {
        return req.user.id;
      }

      return ipKeyGenerator(req.ip);
    },
  });
};

export default rateLimter;
