import Logger from "../utils/logger.js";
/* Remove paidForCoaching, transactions, hasPremium field from profile table */
export async function up(db) {
  const profileCollection = db.collection("profiles");

  const firstResult = await profileCollection.updateMany(
    { hasPremium: { $exists: true } },
    { $unset: { hasPremium: "" } },
  );

  Logger.info("hasPremium field migration completed.", {
    modifiedCount: firstResult.modifiedCount,
  });

  const secResult = await profileCollection.updateMany(
    { paidForCoaching: { $exists: true } },
    { $unset: { paidForCoaching: "" } },
  );

  Logger.info("paidForCoaching field migration completed.", {
    modifiedCount: secResult.modifiedCount,
  });

  const thirdResult = await profileCollection.updateMany(
    { transactions: { $exists: true } },
    { $unset: { transactions: "" } },
  );

  Logger.info("transactions field migration completed.", {
    modifiedCount: thirdResult.modifiedCount,
  });
}
