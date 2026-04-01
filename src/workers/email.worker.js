import { Worker } from "bullmq";
import Logger from "../utils/logger.js";
import sendResendEmail from "../services/resend.js";
import Env from "../config/index.js";

/* Email Worker */
const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    const recipient = job.data.email;
    const subject = job.data.subject;
    const body = job.data.body;

    await sendResendEmail(recipient, subject, body);
  },
  {
    connection: {
      host: Env.REDIS_HOST,
      port: Number(Env.REDIS_PORT),
    },
  },
);

emailWorker.on("completed", (job) => {
  Logger.info("Email was sent succesfully.", {
    recipient: job.data.email,
    subject: job.data.subject,
  });
});

emailWorker.on("failed", (job) => {
  Logger.info("An error occured while trying to send an email.", {
    recipient: job.data.email,
    subject: job.data.subject,
  });
});

export default emailWorker;
