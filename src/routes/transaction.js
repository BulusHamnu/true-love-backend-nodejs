import express from "express";
import {
  getAllTransaction,
  getTransaction,
} from "../controllers/transactionController.js";
import withAuth from "../middlewares/withAuth.js";

const router = express.Router();

router.get("/", withAuth, getAllTransaction);
router.get("/:id", withAuth, getTransaction);

export default router;
