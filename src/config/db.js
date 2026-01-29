import mongoose from "mongoose";
import { logger } from "../utils/helpers.js";
// import { logInfo, logError } from "../src/utils/helpers.js";

// connect to mongodb
let isConnected = false;
const connectDb = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGODB);
    isConnected = true;
    logger.info("DB connected sucessfully.");
    return true;
  } catch (error) {
    logger.error("An error occur while connecting to db.", error.message);
    return false;
  }
};

// connectDb();
export default connectDb;
