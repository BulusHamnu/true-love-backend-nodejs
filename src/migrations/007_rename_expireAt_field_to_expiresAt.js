import Logger from "../utils/logger.js";

/* Rename expireAt to expiresAt in emailVerification obj */
export async function up(db) {
  const userCollection = db.collection("users");
  const result = await userCollection.updateMany(
    {
      "emailVerification.expireAt": { $exists: true },
    },
    [
      {
        $set: { "emailVerification.expiresAt": "$emailVerification.expireAt" },
      },
      {
        $unset: "emailVerification.expireAt",
      },
    ],
  );

  Logger.info("expireAt field migration completed.", {
    modifiedCounts: result.modifiedCount,
  });
}
