import { Resend } from "resend";
import { env } from "../config/index.js";
import AppError, { ErrorCodes } from "../errors/appError.js";
const resend = new Resend(env.RESEND_API_KEY);

async function sendResendEmail(to, subject, html) {
  const k = await resend.emails.send({
    from: `True Love Transformation <noreply@${env.RESEND_EMAIL_DOMAIN}>`,
    to: [to],
    subject,
    html,
  });

  if (k.error) console.log(k);
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
