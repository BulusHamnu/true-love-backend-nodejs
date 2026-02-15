import Logger from "../utils/logger.js";

/* Remove email field from profile table  */
export async function up(db) {
  const profileCollection = db.collection("profiles");
  const result = await profileCollection.updateMany(
    {
      email: { $exists: true },
    },
    {
      $unset: { email: "" },
    },
  );

  Logger.info("email field migration completed.", {
    modifiedCount: result.modifiedCount,
  });
}
