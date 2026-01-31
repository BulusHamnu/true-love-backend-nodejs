import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import mongoose from "mongoose";
import Transaction from "../models/transaction.model.js";

// get user transactions handler
export async function getAllTransaction(req, res) {
  try {
    // get all user transaction
    const userTransactions = await Transaction.find({ userId: req.user.id });

    res.status(200).json({
      status: true,
      message: "User transactions retrieved sucessfully",
      data: userTransactions,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
    });
  }
}

// get user transaction handler
export async function getTransaction(req, res) {
  try {
    const transactionId = req.params.id;
    // get all user transaction
    const userTransaction = await Transaction.findOne({
      userId: req.user.id,
      _id: transactionId,
    });
    if (!userTransaction)
      return res
        .status(404)
        .json({ status: false, message: "Transaction not found" });

    res.status(200).json({
      status: true,
      message: "Transaction retrieved sucessfully",
      data: userTransaction,
    });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({
      status: false,
      message: "An unexpected error occured.",
    });
  }
}
