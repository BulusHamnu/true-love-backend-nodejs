import Logger from "../utils/logger.js";
import fs from "fs";
import Env from "../config/index.js";
import { MongoClient } from "mongodb";

const _dirname = import.meta.dirname;
const client = new MongoClient(Env.MONGO_DATABASE_HOST);

async function runMigrations() {
  Logger.info("Runing Migrations..");
  await client.connect();
  const db = client.db(Env.MONGO_DATABASE_NAME);

  const scriptPaths = fs
    .readdirSync(_dirname)
    .filter((path) => path !== "index.js")
    .sort();

  const migrationCollection = db.collection("migrations");
  const alreadyRanMigration = await migrationCollection.find().toArray();

  const migrationsTorun = scriptPaths.filter(
    (fileName) =>
      !alreadyRanMigration.find((migration) => migration.name === fileName),
  );

  for (const filePath of migrationsTorun) {
    const currentMigration = await import(`./${filePath}`);
    await currentMigration.up(db);

    await migrationCollection.insertOne({
      name: filePath,
      createdAt: new Date(),
    });
  }
}

runMigrations()
  .then(() => {
    Logger.info("Migration was successful :)");
    client.close();
  })
  .catch((err) => {
    Logger.error("Migration Error :(", err);
    client.close();
  });
