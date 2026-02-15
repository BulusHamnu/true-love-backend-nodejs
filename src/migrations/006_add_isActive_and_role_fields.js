import Logger from "../utils/logger.js";

/* Add isActive and role fields migration */
export async function up(db) {
  const userCollection = db.collection("users");
  const firstResult = await userCollection.updateMany(
    {
      isActive: { $exists: false },
    },
    {
      $set: { isActive: true },
    },
  );
  Logger.info("isActive field migration completed.", {
    modifiedCount: firstResult.modifiedCount,
  });

  const secondResult = await userCollection.updateMany(
    {
      role: { $exists: false },
    },
    {
      $set: { role: "user" },
    },
  );

  Logger.info("role field migration completed.", {
    modifiedCount: secondResult.modifiedCount,
  });
}
