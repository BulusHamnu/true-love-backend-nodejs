import { Worker } from "bullmq";
import Logger from "../utils/logger.js";
import sendResendEmail from "../services/resend.js";
import Env from "../config/index.js";
import { formatAmount } from "../utils/helpers.js";
import EmailTemplates from "../utils/emailTemplates.js";

/* Email Worker */
const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    if (job.name === "totur-payment-email") {
      const recipient = job.data.email;
      const subject = job.data.subject;
      const toturName = job.data.toturName;
      const amount = job.data.amount;
      const customerEmail = job.data.customerEmail;
      const customerName = job.data.customerName;
      const productType = job.data.product;

      let body = undefined;
      if (productType === Env.SELF_GUIDED_PRODUCT_NAME) {
        body = EmailTemplates.toturSelfGuidedTemplate(
          toturName,
          customerName,
          customerEmail,
          formatAmount(amount),
          `${new Date().toLocaleDateString()}`,
        );
      } else {
        body = EmailTemplates.toturCoachingTemplate(
          toturName,
          customerName,
          customerEmail,
          formatAmount(amount),
          `${new Date().toLocaleDateString()}`,
        );
      }

      await sendResendEmail(recipient, subject, body);
      //
    } else if (job.name === "customer-payment-email") {
      const recipient = job.data.email;
      const subject = job.data.subject;
      const name = job.data.name;

      let body = undefined;
      if (productType === Env.SELF_GUIDED_PRODUCT_NAME) {
        body = EmailTemplates.customerSelfGuidedTemplate(name);
      } else {
        body = EmailTemplates.customerCoachingTemplate(name);
      }

      await sendResendEmail(recipient, subject, body);
    }

    // await sendResendEmail(recipient, subject, body);
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
