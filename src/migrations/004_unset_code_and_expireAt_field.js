import Logger from "../utils/logger.js";

/* Remove code and expireAt field from resetPasswordVerification  */
export async function up(db) {
  const userCollection = db.collection("users");
  await userCollection.updateMany({}, [
    {
      $unset: "resetPasswordVerification.code",
    },
    {
      $unset: "resetPasswordVerification.expireAt",
    },
  ]);

  Logger.info("code and expireAt removed successfully.");
}
