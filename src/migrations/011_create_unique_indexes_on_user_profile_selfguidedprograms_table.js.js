import Logger from "../utils/logger.js";

/* Change or create new indexes for Users, SelfGuidedProgram and Profiles tables. */
async function createUniqueIndex(db, collectionName, field) {
  const collection = db.collection(collectionName);
  const indexes = await collection.indexes();

  const index = indexes.find((index) => index.key[field]);
  if (!index?.unique) {
    if (index) {
      await collection.dropIndex(index.name);
      Logger.info(`Old ${field} index was deleted.`);
    }

    const newIndex = await collection.createIndex(
      { [field]: 1 },
      { unique: true },
    );

    Logger.info(`New unique ${field} index created: ${newIndex}.`);
  }
}

async function createUniquePartialIndexWithCleanup({
  db,
  collectionName,
  field,
  cleanupQuery,
  unsetFields,
  filterExpression,
}) {
  const collection = db.collection(collectionName);
  const indexes = await collection.indexes();

  const index = indexes.find((index) => index.key[field]);
  if (!index?.unique || !index?.partialFilterExpression) {
    if (index) {
      await collection.dropIndex(index.name);
      Logger.info(`Old ${field} index was deleted.`);
    }

    // Function for cleaning up old documents or unsetting fields that may cause duplicate key error.
    await collection.updateMany(cleanupQuery, { $unset: unsetFields });
    const newIndex = await collection.createIndex(
      { [field]: 1 },
      {
        unique: true,
        partialFilterExpression: { [field]: filterExpression },
      },
    );

    Logger.info(`New unique ${field} index created: ${newIndex}.`);
  }
}

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
    filterExpression: { "google.googleId": { $exists: true } },
  });

  // Profiles userId index migration
  await createUniquePartialIndexWithCleanup({
    db,
    collectionName: "profiles",
    field: "stripeCustomerId",
    cleanupQuery: { stripeCustomerId: "" },
    unsetFields: { stripeCustomerId: "" },
    filterExpression: { stripeCustomerId: { $exists: true } },
  });

  Logger.info(
    "email, googleId, selfGuidedProgram userId, profile userId, and stripeCustomerId Indexes migration completed.",
  );
}
