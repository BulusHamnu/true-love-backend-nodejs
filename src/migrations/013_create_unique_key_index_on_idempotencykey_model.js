import Logger from "../utils/logger.js";
import { createUniqueIndex } from "./helpers/migrationUtils.js";

/* Create unique index on key field */
export async function up(db) {
  await createUniqueIndex(db, "idempotencykeys", "key");
  Logger.info("idempotencykey key field index migration completed.");
}
