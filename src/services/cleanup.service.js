import IdempotencyKey from "../models/idempotency_key.model.js";

export async function cleanUpOldIdempotencyKeyRecords() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const result = await IdempotencyKey.deleteMany({
    createdAt: { $lt: cutoff },
  });

  if (!result.acknowledged) {
    throw new Error("Cleanup failed");
  }
}
