import { Resend } from "resend";
import { env } from "../config/index.js";
import { logError, logger, logInfo } from "../utils/helpers.js";

const resend = new Resend(env.RESEND_API_KEY);

async function sendResendEmail(to, subject, html) {
  try {
    const k = await resend.emails.send({
      from: `True Love Transformation <noreply@exponential-education.com>`,
      to: [to],
      subject,
      html,
    });

    if (k.error) throw new Error(k.error.message);
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
}

export default sendResendEmail;
