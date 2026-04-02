import { Worker } from "bullmq";
import Logger from "../utils/logger.js";
import sendResendEmail from "../services/resend.js";
import Env from "../config/index.js";
import { formatAmount } from "../utils/helpers.js";
import EmailTemplates from "../utils/emailTemplates.js";
import * as cleanUpService from "../services/cleanup.service.js";
import connectDb from "../config/db.js";

(async () => {
  await connectDb();
})();

/* Main queue worker */
const mainWorker = new Worker(
  "main-queue",
  async (job) => {
    const jobName = job.name;
    const data = job.data;

    switch (jobName) {
      case "totur-payment-email": {
        const {
          email,
          subject,
          productType,
          toturName,
          amount,
          customerEmail,
          customerName,
        } = data;

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

        await sendResendEmail(email, subject, body);
        break;
      }

      case "customer-payment-email": {
        const { email, subject, productType, name } = data;

        let body = undefined;
        if (productType === Env.SELF_GUIDED_PRODUCT_NAME) {
          body = EmailTemplates.customerSelfGuidedTemplate(name);
        } else {
          body = EmailTemplates.customerCoachingTemplate(name);
        }

        await sendResendEmail(email, subject, body);
        break;
      }

      case "verification-email": {
        const { email, subject, code, name } = data;

        await sendResendEmail(
          email,
          subject,
          EmailTemplates.emailVerificationTemplate(name, code),
        );
        break;
      }

      case "default-password-welcome-email": {
        const { email, subject, defaultPassword } = data;

        await sendResendEmail(
          email,
          subject,
          EmailTemplates.defaultPasswordTemplate(
            "Cupid's chosen",
            email,
            defaultPassword,
          ),
        );
        break;
      }

      case "reset-password-email": {
        const { email, subject, otpCode } = data;

        await sendResendEmail(
          email,
          subject,
          EmailTemplates.passwordVerificationTemplate(otpCode),
        );
        break;
      }

      case "password-reset-succesful-email": {
        const { email, subject, name } = data;

        await sendResendEmail(
          email,
          subject,
          EmailTemplates.paswordResetSucessful(name),
        );
        break;
      }

      case "idempontencykeys-cleanup": {
        await cleanUpService.cleanUpOldIdempotencyKeyRecords();
        break;
      }

      default: {
        throw new Error(`Unknown job - ${job.name}`);
      }
    }
  },
  {
    connection: {
      host: Env.REDIS_HOST,
      port: Number(Env.REDIS_PORT),
    },
    concurrency: 5,
  },
);

mainWorker.on("completed", (job) => {
  const data = job.data;
  Logger.info(`${job.name} - job was executed successfully`, data);
});

mainWorker.on("failed", (job) => {
  const data = job.data;
  Logger.error(`An error occured while executing - ${job.name} job.`, data);
});

export default mainWorker;
