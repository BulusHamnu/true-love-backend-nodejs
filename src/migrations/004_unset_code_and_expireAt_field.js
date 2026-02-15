import Logger from "../utils/logger.js";

/* Remove code and expireAt field from resetPasswordVerification  */
export async function up(db) {
  const userCollection = db.collection("users");
  const firstResult = await userCollection.updateMany(
    {
      "resetPasswordVerification.otpCode": { $exists: true },
    },
    {
      $unset: { "resetPasswordVerification.code": null },
    },
  );
  Logger.info("code field migration completed.", {
    modifiedCount: firstResult.modifiedCount,
  });

  const secondResult = await userCollection.updateMany(
    {
      "resetPasswordVerification.otpCodeExpiresAt": { $exists: true },
    },
    {
      $unset: { "resetPasswordVerification.expireAt": null },
    },
  );

  Logger.info("expireAt field migration completed.", {
    modifiedCount: secondResult.modifiedCount,
  });
}
