import mongoose from "mongoose";
import { logInfo, logError } from "../src/utils/helpers.js";

// connect to mongodb
let isConnected = false;
const connectDb = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGODB);
    isConnected = true;
    logInfo("DB connected sucessfully.");
    return true;
  } catch (error) {
    logError("An error occur while connecting to db.", error.message);
    return false;
  }
};

// connectDb();
export default connectDb;
