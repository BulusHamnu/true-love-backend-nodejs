import AppError, { ErrorCodes } from "../errors/appError.js";
import { createNewUser } from "./auth.service.js";
import { generateRandPassword, signToken } from "../utils/helpers.js";
import bcrypt from "bcryptjs";
import Env from "../config/index.js";
import User from "../models/user.model.js";
import axios from "axios";
import qs from "qs";
import Logger from "../utils/logger.js";
import { OAuth2Client } from "google-auth-library";

/* Decode google id function */
async function verifyIdToken(idToken) {
  const client = new OAuth2Client(Env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: Env.TRUE_LOVE_GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  return payload;
}

/* Process google callback function */
async function exchangeCodeForUserToken(accessCode) {
  for (const attempt = 1; attempt < 3; attempt++) {
    try {
      return await axios.post(
        Env.GOOGLE_TOKEN_REQUEST_URL,
        qs.stringify({
          code: accessCode,
          client_id: Env.TRUE_LOVE_GOOGLE_CLIENT_ID,
          client_secret: Env.TRUE_LOVE_GOOGLE_CLIENT_SECRET,
          grant_type: "authorization_code",
          redirect_uri: `${Env.BACKEND_URL}/api/auth/google/callback`,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );
    } catch (error) {
      if (attempt === 3) {
        throw new AppError(
          ErrorCodes.UNEXPECTED_ERROR,
          "An error occured while making request to retreive google token.",
          { status: 500, isOperational: false, cause: error },
        );
      }

      Logger.info(`Attempt ${attempt} failed, retrying in 1s...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

export async function processGoogleCallbackReq(state, code) {
  const response = await exchangeCodeForUserToken(code);

  const idToken = response?.data.id_token;
  const payload = await verifyIdToken(idToken);
  if (!payload)
    throw new AppError(
      ErrorCodes.UNEXPECTED_ERROR,
      "Unable to retreive google id token.",
      { status: 500, isOperational: false },
    );

  let user = null;
  if (state === "signup") {
    const randPassword = generateRandPassword(7);
    const newUser = await createNewUser({
      provider: "google",
      password: randPassword,
      email: payload.email,
      fullName: payload.name,
      googleId: payload.sub,
      idToken: idToken,
      isVerified: payload.email_verified,
    });

    user = newUser;
  } else if (state === "login") {
    user = await User.findOne({ email: payload.email }).lean();
    if (!user)
      throw new AppError(ErrorCodes.USER_NOT_FOUND, "User not found.", {
        status: 404,
        isOperational: true,
      });

    if (user.provider !== "google") {
      throw new AppError(
        ErrorCodes.GOOGLE_NOT_LINKED,
        "Google not linked to this account.",
        { status: 401, isOperational: true },
      );
    }

    user.id = user._id; // To be able to access 'id' when signing the tokens.
  } else {
    throw new AppError(ErrorCodes.UNEXPECTED_ERROR, "State mismatch.", {
      status: 500,
      isOperational: false,
      details: { state },
    });
  }

  const accessToken = signToken({
    email: user.email,
    id: user.id,
    type: "accessToken",
  });

  const refreshToken = signToken({
    email: user.email,
    id: user.id,
    type: "refreshToken",
  });

  return { accessToken, refreshToken };
}
