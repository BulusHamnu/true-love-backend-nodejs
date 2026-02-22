import express from "express";
import * as transactionController from "../controllers/transaction.controller.js";
import withAuth from "../middlewares/withAuth.js";
import rateLimter from "../middlewares/rateLimiter.js";

const router = express.Router();

router.use(withAuth);
router.get(
  "/",
  rateLimter(5 * 60 * 1000, 25),
  transactionController.getAllTransaction,
);
router.get(
  "/:id",
  rateLimter(5 * 60 * 1000, 25),
  transactionController.getTransactionHandler,
);

export default router;
