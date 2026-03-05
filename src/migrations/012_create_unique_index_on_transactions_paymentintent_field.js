import Logger from "../utils/logger.js";
import { createUniquePartialIndexWithCleanup } from "./helpers/migrationUtils.js";

/* Create unique index on paymentIntent field */
export async function up(db) {
  await createUniquePartialIndexWithCleanup({
    db,
    collectionName: "transactions",
    field: "paymentIntent",
    cleanupQuery: null,
    unsetFields: null,
    filterExpression: { $type: "string" },
  });

  const K = ["users", "profiles", "transactions", "selfguidedprograms"];
  const J = K.map((collection) => {
    const w = db.collection(collection);
    return w.indexes();
  });
  console.dir(await Promise.all(J), { depth: null });

  Logger.info("transaction paymentIntent field migration completed.");
}
