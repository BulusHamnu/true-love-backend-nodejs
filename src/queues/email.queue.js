import { Queue } from "bullmq";
import Env from "../config/index.js";

/* Email Queue */
const emailQueue = new Queue("email-queue", {
  connection: {
    host: Env.REDIS_HOST,
    port: Number(Env.REDIS_PORT),
  },
});

export default emailQueue;
