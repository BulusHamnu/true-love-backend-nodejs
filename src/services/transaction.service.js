import Transaction from "../models/transaction.model.js";
import AppError, { ErrorCodes } from "../errors/appError.js";

export async function retrieveTransaction(userId, transactionId) {
  const transaction = await Transaction.findOne({
    userId,
    _id: transactionId,
  });

  if (!transaction)
    throw new AppError(
      ErrorCodes.TRANSACTION_NOT_FOUND,
      "Transaction not found.",
      { status: 404, isOperational: true },
    );

  return transaction;
}

export async function getAllTransaction(userId) {
  return await Transaction.find({ userId });
}
