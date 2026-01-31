import mongoose from "mongoose";
import Logger from "../utils/logger.js";
// import { logInfo, logError } from "../src/utils/helpers.js";

// connect to mongodb
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB);
    Logger.info("DB connected sucessfully.");
  } catch (error) {
    Logger.error("An error occur while connecting to db.", error.message);
    process.exit(1);
  }
};

// connectDb();
export default connectDb;
