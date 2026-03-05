import Logger from "../utils/logger.js";
import {
  createUniqueIndex,
  createUniquePartialIndexWithCleanup,
} from "./helpers/migrationUtils.js";

/* Change or create new indexes for Users, SelfGuidedProgram and Profiles tables. */
export async function up(db) {
  // Users email index migration
  await createUniqueIndex(db, "users", "email");

  // SelfGuidedPrograms userId index migration
  await createUniqueIndex(db, "selfguidedprograms", "userId");

  // Profile userId migration
  await createUniqueIndex(db, "profiles", "userId");

  // Users googleId index migration
  await createUniquePartialIndexWithCleanup({
    db,
    collectionName: "users",
    field: "google.googleId",
    cleanupQuery: { "google.googleId": "" },
    unsetFields: { "google.googleId": "", "google.idToken": "" },
    filterExpression: { $exists: true },
  });

  // Profiles userId index migration
  await createUniquePartialIndexWithCleanup({
    db,
    collectionName: "profiles",
    field: "stripeCustomerId",
    cleanupQuery: { stripeCustomerId: "" },
    unsetFields: { stripeCustomerId: "" },
    filterExpression: { $exists: true },
  });

  Logger.info(
    "email, googleId, selfGuidedProgram userId, profile userId, and stripeCustomerId Indexes migration completed.",
  );
}
