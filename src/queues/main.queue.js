import { Queue } from "bullmq";
import Env from "../config/index.js";

/* Email Queue */
const mainQueue = new Queue("main-queue", {
  connection: {
    host: Env.REDIS_HOST,
    port: Number(Env.REDIS_PORT),
  },
});

export default mainQueue;
