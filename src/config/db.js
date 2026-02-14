import mongoose from "mongoose";
import Logger from "../utils/logger.js";
import Env from "./index.js";

/* Connect to mongodb */
const connectDb = async () => {
  try {
    await mongoose.connect(Env.MONGO_DATABASE_URI);
    Logger.info("DB connected sucessfully.");
  } catch (error) {
    Logger.error("An error occur while connecting to db.", error.message);
    process.exit(1);
  }
};

export default connectDb;
