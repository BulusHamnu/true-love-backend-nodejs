import Logger from "../utils/logger.js";

/* Add  resetToken and resetTokenExpiresAt field to resetPasswordVerification*/
// "resetPasswordVerification.otpCode": { $exists: true },
// "resetPasswordVerification.otpCodeExpiresAt": { $exists: true },
export async function up(db) {
  const userCollection = db.collection("users");
  await userCollection.updateMany({}, [
    {
      $set: {
        "resetPasswordVerification.resetToken": "",
      },
    },
    {
      $set: {
        "resetPasswordVerification.resetTokenExpiresAt": "",
      },
    },
  ]);

  Logger.info(
    "resetToken and resetTokenExpiresAt fields was added successfully.",
  );
}
