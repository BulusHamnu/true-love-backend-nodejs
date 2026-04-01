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
      const data = job.data;
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
      //
    } else if (job.name === "customer-payment-email") {
      const data = job.data;
      const { email, subject, productType, name } = data;

      let body = undefined;
      if (productType === Env.SELF_GUIDED_PRODUCT_NAME) {
        body = EmailTemplates.customerSelfGuidedTemplate(name);
      } else {
        body = EmailTemplates.customerCoachingTemplate(name);
      }

      await sendResendEmail(email, subject, body);
      //
    } else if (job.name === "verification-email") {
      const data = job.data;
      const { email, subject, code, name } = data;

      await sendResendEmail(
        email,
        subject,
        EmailTemplates.emailVerificationTemplate(name, code),
      );
      //
    } else if (job.name === "default-password-welcome-email") {
      const data = job.data;
      const { email, subject, defaultPassword } = data;

      await sendResendEmail(
        email,
        subject,
        EmailTemplates.defaultPasswordTemplate(
          "Cupid's chosen",
          recipient,
          defaultPassword,
        ),
      );
      //
    } else if (job.name === "reset-password-email") {
      const data = job.data;
      const { email, subject, otpCode } = data;

      await sendResendEmail(
        email,
        subject,
        EmailTemplates.passwordVerificationTemplate(otpCode),
      );
      //
    } else if (job.name === "password-reset-succesful-email") {
      const data = job.data;
      const { email, subject, name } = data;

      await sendResendEmail(
        email,
        subject,
        EmailTemplates.paswordResetSucessful(name),
      );
      //
    } else {
      const data = job.data;
      const { email, subject, body } = data;

      await sendResendEmail(email, subject, body);
    }
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
    jobName: job.name,
    recipient: job.data.email,
    subject: job.data.subject,
  });
});

emailWorker.on("failed", (job) => {
  Logger.error("An error occured while trying to send an email.", {
    jobName: job.name,
    recipient: job.data.email,
    subject: job.data.subject,
  });
});

export default emailWorker;
