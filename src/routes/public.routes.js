import { Router } from "express";
import getAppStats from "../controllers/get-app-stats.controller.js";
import rateLimter from "../middlewares/rateLimiter.js";

const router = Router();
router.get("/app-stats", rateLimter(3 * 60 * 1000, 20, "ip"), getAppStats);

export default router;
