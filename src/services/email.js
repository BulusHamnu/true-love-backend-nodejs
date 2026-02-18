import nodemailer from "nodemailer";
import { env } from "../config/index.js";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: env.EMAIL,
    pass: env.EMAIL_PASSWORD,
  },
});

/* Send email function */
export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"True Love Transformation" <${env.EMAIL}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
};
