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

  Logger.info("transaction paymentIntent field migration completed.");
}
