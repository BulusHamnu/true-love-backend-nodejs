/* Transaction Mapper */
export function mapTransactionToResponse(transaction) {
  return {
    id: transaction._id,
    amount: transaction.amount,
    status: transaction.status,
    type: transaction.type,
    paymentIntent: transaction.paymentIntent,
    date: transaction.createdAt,
  };
}

/* Transactions Mapper */
export function mapTransactionsToResponse(transactions) {
  return transactions.map((transaction) =>
    mapTransactionToResponse(transaction),
  );
}
