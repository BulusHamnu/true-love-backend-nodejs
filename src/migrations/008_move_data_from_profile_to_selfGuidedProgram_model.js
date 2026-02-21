import Logger from "../utils/logger.js";
import Env from "../config/index.js";

/* Move old selfGuidedProgram data from profile table to new selfGuidedProgram */
export async function up(db) {
  const profileCollection = db.collection("profiles");
  const selfGuidedProgramCollection = db.collection("selfguidedprograms");
  const transactionCollection = db.collection("transactions");

  const [profiles, transactions] = await Promise.all([
    profileCollection.find({ selfGuidedProgram: { $exists: true } }).toArray(),
    transactionCollection
      .find({
        $or: [
          // Both transaction type grant access for Self Guided Program
          { type: Env.SELF_GUIDED_PRODUCT_NAME },
          { type: Env.COACHING_PRODUCT_NAME },
        ],
      })
      .toArray(),
  ]);

  const usersThatPurchasedProgram = transactions.map(
    (transaction) => transaction.userId,
  );
  const selfGuidedPrograms = await selfGuidedProgramCollection
    .find({
      userId: { $in: usersThatPurchasedProgram },
    })
    .toArray();

  const programs = selfGuidedPrograms.map((program) => String(program.userId));
  const userIdsStringList = usersThatPurchasedProgram.map((P) => String(P));

  const allNewSelfGuidedProgram = [];
  profiles.forEach((profile) => {
    const userId = String(profile.userId);

    if (!userIdsStringList.includes(userId)) return;
    if (programs.includes(userId)) return;

    const selfGuidedProgram = profile.selfGuidedProgram;
    const oldReflectionMessages = selfGuidedProgram.reflectionMessages;
    const oldGptResponse = selfGuidedProgram.gptResponses || {}; // Some profiles don't have gptResponse obj

    const newSelfGuidedObj = {};
    newSelfGuidedObj.reflections = [];

    newSelfGuidedObj.currentWeek =
      selfGuidedProgram.programProgress.currentWeek;
    newSelfGuidedObj.totalWeek = selfGuidedProgram.programProgress.totalWeek;
    newSelfGuidedObj.userId = profile.userId;

    for (const key of Object.keys(oldReflectionMessages)) {
      if (!oldReflectionMessages[key]) continue;
      const weekNumber = key[key.length - 1];

      const week = {
        week: Number(weekNumber),
        message: oldReflectionMessages[key],
        gptResponse: oldGptResponse[key] || null,
        createdAt: new Date(),
      };

      newSelfGuidedObj["reflections"].push(week);
    }

    allNewSelfGuidedProgram.push(newSelfGuidedObj);
  });

  if (allNewSelfGuidedProgram && allNewSelfGuidedProgram.length <= 0) {
    Logger.info("selfGuidedProgram migration completed.", {
      insertedCount: 0,
    });
    return;
  }

  const result = await selfGuidedProgramCollection.insertMany(
    allNewSelfGuidedProgram,
  );

  Logger.info("selfGuidedProgram migration completed.", {
    insertedCount: result.insertedCount,
  });
}
