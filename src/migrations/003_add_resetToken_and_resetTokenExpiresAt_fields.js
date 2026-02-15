import Logger from "../utils/logger.js";

/* Add  resetToken and resetTokenExpiresAt field to resetPasswordVerification*/
export async function up(db) {
  const userCollection = db.collection("users");
  const result = await userCollection.updateMany(
    {
      $or: [
        {
          "resetPasswordVerification.resetTokenExpiresAt": { $exists: false },
        },
        {
          "resetPasswordVerification.resetToken": { $exists: false },
        },
      ],
    },

    {
      $set: {
        "resetPasswordVerification.resetToken": null,
        "resetPasswordVerification.resetTokenExpiresAt": null,
      },
    },
  );

  Logger.info("resetToken and resetTokenExpiresAt field migration completed.", {
    modifiedCount: result.modifiedCount,
  });
}
