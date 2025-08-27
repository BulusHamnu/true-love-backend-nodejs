import { rateLimit } from "express-rate-limit";

const rateLimter = (time, limit, key) => {
  return rateLimit({
    windowMs: time,
    limit: limit,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(403).json({
        status: false,
        message: "Too many request please try again later.",
      });
    },
    keyGenerator: (req, res) => {
      if (key === "user-id" && res.user && res.user.id) {
        return req.user.id;
      }

      return req.ip;
    },
  });
};

export default rateLimter;
