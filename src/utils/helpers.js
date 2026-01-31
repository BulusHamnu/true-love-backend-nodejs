import Env from "../config/index.js";
import Logger from "./logger.js";

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
