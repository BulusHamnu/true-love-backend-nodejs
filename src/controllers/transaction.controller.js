import * as transactionService from "../services/transaction.service.js";
import { objectIdField } from "../utils/validators.js";
import validateAndSanitizeBody from "../utils/validateAndSanitizeData.js";
import {
  mapTransactionToResponse,
  mapTransactionsToResponse,
} from "../mappers/transaction.mapper.js";

/* Get all transactions handler */
// The reason why there is no pagination when getting all transactions is because there is only two transactions that will ever happen from a user.
export async function getAllTransaction(req, res, next) {
  try {
    const userId = req.user.id;

    const transactions = await transactionService.retrieveTransactions(userId);
    const transactionsRes = mapTransactionsToResponse(transactions);

    res.status(200).json({
      status: true,
      message: "Transactions retrieved successfully.",
      data: transactionsRes,
    });
  } catch (error) {
    next(error);
  }
}

/* Get single transaction handler */
export async function validateTransactionId(id) {
  return validateAndSanitizeBody(id, objectIdField);
}

export async function getTransactionHandler(req, res, next) {
  try {
    const userId = req.user.id;

    const transactionId = await validateTransactionId(req.params.id);
    const transaction = await transactionService.retrieveTransaction(
      userId,
      transactionId,
    );

    const transactionRes = mapTransactionToResponse(transaction);

    res.status(200).json({
      status: true,
      message: "Transaction retrieved successfully.",
      data: transactionRes,
    });
  } catch (error) {
    next(error);
  }
}
