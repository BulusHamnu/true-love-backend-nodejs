import Logger from "../utils/logger.js";

/* Rename code to otpCode */
export async function up(db) {
  const userCollection = db.collection("users");
  await userCollection.updateMany(
    {
      "resetPasswordVerification.code": { $exists: true },
      "resetPasswordVerification.otpCode": { $exists: false },
    },
    [
      {
        $set: {
          "resetPasswordVerification.otpCode":
            "$resetPasswordVerification.code",
        },
      },
    ],
  );

  Logger.info("ResetPasswordVerification code field renamed successfully.");
}
