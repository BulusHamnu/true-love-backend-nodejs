import { Resend } from "resend";
import Env from "../config/index.js";
import AppError, { ErrorCodes } from "../errors/appError.js";
import Logger from "../utils/logger.js";
const resend = new Resend(Env.RESEND_API_KEY);

async function sendResendEmail(to, subject, html) {
  const k = await resend.emails.send({
    from: `True Love Transformation <noreply@${Env.RESEND_EMAIL_DOMAIN}>`,
    to: [to],
    subject,
    html,
  });

  if (k.error)
    throw new AppError(
      ErrorCodes.EMAIL_DELIVERY_FAILED,
      k.error?.message,
      500,
      false,
      {
        to,
        subject,
      },
    );
}

export default sendResendEmail;
