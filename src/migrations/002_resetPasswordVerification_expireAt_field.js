import Logger from "../utils/logger.js";

/* Rename expireAt to otpCodeExpiredAt */
export async function up(db) {
  const userCollection = db.collection("users");
  const result = await userCollection.updateMany(
    {
      "resetPasswordVerification.expireAt": { $exists: true },
      "resetPasswordVerification.otpCodeExpiresAt": { $exists: false },
    },
    [
      {
        $set: {
          "resetPasswordVerification.otpCodeExpiresAt":
            "$resetPasswordVerification.expireAt",
        },
      },
    ],
  );

  Logger.info("ResetPasswordVerification expireAt field migration completed.", {
    modifiedCount: result.modifiedCount,
  });
}
