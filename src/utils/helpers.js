import winston from "winston";
const { createLogger, transports, format, printf, colorize } = winston;
import Env from "../config/index.js";

/* Format money function */
export const formatAmount = (amountCents) => {
  const amountDollars = parseInt(amountCents) / 100;
  const amountFormatted = amountDollars.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return amountFormatted;
};


/* Generate rand code function */
export const generateCode = (length = 6) => {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10); // digit 0–9
  }
  return code;
};

/* Logger setup */
const myFormat = format.printf(
  ({ level, message, timestamp, stack, ...meta }) => {
    if (stack) return `[${timestamp}] ${level}: ${message} ${stack} `;
    return `[${timestamp}] ${level}: ${message} ${
      Object.keys(meta).length > 0 ? JSON.stringify(meta) : ""
    }`;
  },
);

export const logger = createLogger({
  level: "debug",
  format: format.combine(format.errors({ stack: true })),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.timestamp(), myFormat),
    }),
  ],
});

// logger.add(
//   new transports.File({
//     filename: "app.log",
//     format: format.combine(
//       format.timestamp(),
//       format.json(),
//       format.prettyPrint()
//     ),
//   })
// );

// function for decoding googe id token
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(Env.GOOGLE_CLIENT_ID);

export async function verifyIdToken(idToken) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: Env.TRUE_LOVE_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    logger.error(error);
    return null;
  }
}
