import Logger from "../utils/logger.js";
/* Remove selfGuidedProgram field from profile table */
export async function up(db) {
  const profileCollection = db.collection("profiles");

  const result = await profileCollection.updateMany(
    { selfGuidedProgram: { $exists: true } },
    { $unset: { selfGuidedProgram: "" } },
  );

  Logger.info("selfGuidedProgram removal migration completed.", {
    modifiedCount: result.modifiedCount,
  });
}
