import Logger from "../../utils/logger.js";

/* Helper function for creating unique index on a collection. */
export async function createUniqueIndex(db, collectionName, field) {
  const collection = db.collection(collectionName);
  const indexes = await collection.indexes();

  const index = indexes.find((index) => index.key[field]);
  if (!index?.unique) {
    if (index) {
      await collection.dropIndex(index.name);
      Logger.info(
        `Old ${field} index was deleted in ${collectionName} collection.`,
      );
    }

    const newIndex = await collection.createIndex(
      { [field]: 1 },
      { unique: true },
    );

    Logger.info(
      `New unique ${field} index created: ${newIndex} in ${collectionName} collection.`,
    );
  }
}

/* Helper function for creating unique index on a collection with partialFilter and also support cleaning of document before running to prevent duplicate key error */
export async function createUniquePartialIndexWithCleanup({
  db,
  collectionName,
  field,
  cleanupQuery,
  unsetFields,
  filterExpression,
}) {
  const collection = db.collection(collectionName);
  const indexes = await collection.indexes();

  const index = indexes.find((index) => index.key[field]);
  if (!index?.unique || !index?.partialFilterExpression) {
    if (index) {
      await collection.dropIndex(index.name);
      Logger.info(
        `Old ${field} index was deleted in ${collectionName} collection.`,
      );
    }

    // Function for cleaning up old documents or unsetting fields that may cause duplicate key error.
    if (cleanupQuery && unsetFields) {
      await collection.updateMany(cleanupQuery, { $unset: unsetFields });
    }

    const newIndex = await collection.createIndex(
      { [field]: 1 },
      {
        unique: true,
        partialFilterExpression: { [field]: filterExpression },
      },
    );

    Logger.info(
      `New unique ${field} index created: ${newIndex} in ${collectionName} collection.`,
    );
  }
}
