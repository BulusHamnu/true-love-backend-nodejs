import Logger from "../utils/logger.js";

/* Change or create new indexes for Users, SelfGuidedProgram and Profiles tables. */
export async function up(db) {
  const userCollection = db.collection("users");
  const usersIndexes = await userCollection.indexes();

  // Users email index migration
  const emailIndex = usersIndexes.find((index) => index.key["email"]);
  if (!emailIndex?.unique) {
    if (emailIndex) {
      await userCollection.dropIndex(emailIndex.name);
      Logger.info("Old email index was deleted.");
    }

    const newEmailIndex = await userCollection.createIndex(
      { email: 1 },
      { unique: true },
    );
    Logger.info(`New unique email index created: ${newEmailIndex}.`);
  }

  // Users googleId index migration
  const googleIdIndex = usersIndexes.find(
    (index) => index.key["google.googleId"],
  );

  if (!googleIdIndex?.unique || !googleIdIndex?.partialFilterExpression) {
    if (googleIdIndex) {
      await userCollection.dropIndex(googleIdIndex.name);
      Logger.info("Old google.googleId index was deleted.");
    }

    // Because old document were created with googleId and idToken having empty string as default values, we need to delete them so that we will not have duplicate key error.
    await userCollection.updateMany(
      { "google.googleId": "" },
      {
        $unset: { "google.googleId": "", "google.idToken": "" },
      },
    );

    const newGoogleIdIndex = await userCollection.createIndex(
      { "google.googleId": 1 },
      {
        unique: true,
        partialFilterExpression: { "google.googleId": { $exists: true } },
      },
    );
    Logger.info(`New unique googleId index created: ${newGoogleIdIndex}.`);
  }

  // selfGuidedPrograms userId index migration
  const selfGuidedCollections = db.collection("selfguidedprograms");
  const selfGuidedIndexes = await selfGuidedCollections.indexes();
  const selfGuidedUserIdIndex = selfGuidedIndexes.find(
    (index) => index.key["userId"],
  );
  if (!selfGuidedUserIdIndex?.unique) {
    if (selfGuidedUserIdIndex) {
      await selfGuidedCollections.dropIndex(selfGuidedUserIdIndex.name);
      Logger.info("Old selfGuidedPrograms userId index was deleted.");
    }

    const newUserIdIndex = await selfGuidedCollections.createIndex(
      { userId: 1 },
      { unique: true },
    );
    Logger.info(
      `New unique selfGuidedPrograms userId index created: ${newUserIdIndex}.`,
    );
  }

  // stripeCustomerId index migration
  const profileCollection = db.collection("profiles");
  const profilesIndexes = await profileCollection.indexes();

  const stripeCustomerIdIndex = profilesIndexes.find(
    (index) => index.key["stripeCustomerId"],
  );

  if (
    !stripeCustomerIdIndex?.unique ||
    !stripeCustomerIdIndex?.partialFilterExpression
  ) {
    if (stripeCustomerIdIndex) {
      await profileCollection.dropIndex(stripeCustomerIdIndex.name);
      Logger.info("Old profiles stripeCustomerId index was deleted.");
    }

    // Because old document were created with stripeCustomerId having empty string as default value, we need to delete it, so that we will not have duplicate key failure.
    await profileCollection.updateMany(
      { stripeCustomerId: "" },
      {
        $unset: { stripeCustomerId: "" },
      },
    );

    const newStripeCustomerIdIndex = await profileCollection.createIndex(
      { stripeCustomerId: 1 },
      {
        unique: true,
        partialFilterExpression: { stripeCustomerId: { $exists: true } },
      },
    );
    Logger.info(
      `New unique profiles stripeCustomerId index created: ${newStripeCustomerIdIndex}.`,
    );
  }

  // Profile userId migration
  const profileUserIdIndex = profilesIndexes.find(
    (index) => index.key["userId"],
  );

  if (!profileUserIdIndex?.unique) {
    if (profileUserIdIndex) {
      await profileCollection.dropIndex(profileUserIdIndex.name);
      Logger.info("Old profiles userId index was deleted.");
    }

    const newUserIdIndex = await profileCollection.createIndex(
      { userId: 1 },
      { unique: true },
    );
    Logger.info(`Unique profiles userId index created: ${newUserIdIndex}.`);
  }

  Logger.info(
    "email, googleId, selfGuidedProgram userId, profile userId, and stripeCustomerId Indexes migration completed.",
  );
}
