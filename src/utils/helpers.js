import Env from "../config/index.js";
import Logger from "./logger.js";
import jwt from "jsonwebtoken";

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

/* Generate random password button */
export function generateRandPassword(limit = 10) {
  const character = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[]|\:;"'<>,.?/~`;

  let randomPassword = "";
  for (let i = 0; i < limit; i++) {
    const index = Math.floor(Math.random() * character.length);
    randomPassword += character[index];
  }
  return randomPassword;
}

/* Sign token function */
export function signToken({ email, id, isVerified, type }) {
  const tokenSecret =
    type === "refreshToken"
      ? Env.REFRESH_TOKEN_SECRET_KEY
      : Env.TOKEN_SECRET_KEY;
  const expiresIn = type === "refreshToken" ? "7d" : "24h";

  return jwt.sign(
    {
      email,
      id,
      isVerified,
      type,
    },
    tokenSecret,
    { expiresIn },
  );
}
