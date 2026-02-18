import * as transactionService from "../services/transaction.service.js";

/* Get all transactions handler */
// The reason why there is no pagination when getting all transactions is because there is only two transactions that will ever happen from a user.
export async function getAllTransaction(req, res, next) {
  try {
    const userId = req.user.id;

    const transactions = await transactionService.getAllTransaction(userId);

    res.status(200).json({
      status: true,
      message: "Transactions retrieved sucessfully",
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
}

/* Get single transactio handler */
export async function getTransaction(req, res, next) {
  try {
    const transactionId = req.params.id;
    const userId = req.user.id;

    const transaction = await transactionService.retrieveTransaction(
      userId,
      transactionId,
    );

    res.status(200).json({
      status: true,
      message: "Transaction retrieved sucessfully",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
}
