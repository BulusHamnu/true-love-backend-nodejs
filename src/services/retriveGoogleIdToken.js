import Env from "../config/index.js";
import axios from "axios";
import qs from "qs";
import { verifyIdToken, logger } from "../utils/helpers.js";
const googleCallbackUrl = "https://oauth2.googleapis.com/token";

export default async function retriveGoogleIdToken(accessCode, redirectUri) {
  try {
    // exchange code for access token
    const response = await axios.post(
      googleCallbackUrl,
      qs.stringify({
        code: accessCode,
        client_id: Env.TRUE_LOVE_GOOGLE_CLIENT_ID,
        client_secret: Env.TRUE_LOVE_GOOGLE_CLIENT_SECRET,
        grant_type: "authorization_code",
        redirect_uri: `${Env.BACKEND_URL}${redirectUri}`,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const payload = await verifyIdToken(response.data.id_token);
    if (!payload) return null;

    logger.info("Google oauth-openid retrive succesful.", {
      email: payload.email,
      name: payload.name,
      emailVerified: payload.email_verified,
    });
    return { ...payload, idToken: response.data.id_token };
  } catch (error) {
    logger.error(error);
    return "";
  }
}
