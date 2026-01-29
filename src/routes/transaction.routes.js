import express from "express";
import {
  getAllTransaction,
  getTransaction,
} from "../controllers/transaction.controller.js";
import withAuth from "../middlewares/withAuth.js";
import rateLimter from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get(
  "/",
  withAuth,
  rateLimter(5 * 60 * 1000, 25, "user-id"),
  getAllTransaction
);
router.get(
  "/:id",
  withAuth,
  rateLimter(5 * 60 * 1000, 25, "user-id"),
  getTransaction
);

export default router;
