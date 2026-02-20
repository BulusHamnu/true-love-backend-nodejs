import Logger from "../utils/logger.js";

/* Move old selfGuidedProgram data from profile table to new selfGuidedProgram */
export async function up(db) {
  const profileCollection = db.collection("profiles");
  const selfGuidedProgramCollection = db.collection("selfguidedprograms");
  const transactionCollection = db.collection("transactions");

  const [profiles, transactions] = await Promise.all([
    profileCollection.find().toArray(),
    transactionCollection.find().toArray(),
  ]);

  const transactionsMap = new Map();
  transactions.forEach((transaction) =>
    transactionsMap.set(String(transaction.userId), transaction),
  );

  const allNewSelfGuidedProgram = [];
  profiles.forEach((profile) => {
    if (!transactionsMap.get(String(profile.userId))) return; // As long as their is a transaction, because transaction can either be self-guided-program or coaching-program and both give access to the Self Guided Program

    const selfGuidedProgram = profile.selfGuidedProgram;
    const oldReflectionMessages = selfGuidedProgram.reflectionMessages;
    const oldGptResponse = selfGuidedProgram.gptResponses || {}; // Some profile don't have gptResponse obj

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

  const result = await selfGuidedProgramCollection.insertMany(
    allNewSelfGuidedProgram,
  );
  Logger.info("selfGuidedProgram migration completed.", {
    insertedCount: result.insertedCount,
  });
}
