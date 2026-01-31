import mongoose from "mongoose";
import Logger from "../utils/logger.js";
// import { logInfo, logError } from "../src/utils/helpers.js";

// connect to mongodb
let isConnected = false;
const connectDb = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGODB);
    isConnected = true;
    Logger.info("DB connected sucessfully.");
    return true;
  } catch (error) {
    Logger.error("An error occur while connecting to db.", error.message);
    return false;
  }
};

// connectDb();
export default connectDb;
