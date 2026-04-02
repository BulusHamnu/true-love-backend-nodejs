import { Queue } from "bullmq";
import Env from "../config/index.js";

/* Email Queue */
const connection = Env.REDIS_CONNECTION;
const mainQueue = new Queue("main-queue", {
  connection,
});

export default mainQueue;
