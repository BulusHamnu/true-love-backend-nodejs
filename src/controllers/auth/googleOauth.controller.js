import Joi from "joi";
import Logger from "../../utils/logger.js";
import validateAndSanitizeData from "../../utils/validateAndSanitizeData.js";
import Env from "../../config/index.js";
import { processGoogleCallbackReq } from "../../services/googleOauth.service.js";
import AppError, { ErrorCodes } from "../../errors/appError.js";

/* Google Oauth handlers */
function verifyGoogleQueryBody(queries) {
  const schema = Joi.object({
    flow: Joi.string().required(true).valid("signup", "login").messages({
      "any.only": "flow value must be signup or login.",
    }),
  });
  return validateAndSanitizeData(queries, schema);
}

export async function retriveGoogleOauthUrl(req, res, next) {
  try {
    const { flow } = verifyGoogleQueryBody(req.query);
    Logger.info("User request for google oauth url.");

    const params = new URLSearchParams({
      client_id: Env.TRUE_LOVE_GOOGLE_CLIENT_ID,
      redirect_uri: `${Env.BACKEND_URL}/api/auth/google/callback`,
      response_type: "code",
      scope: "openid profile email",
      state: flow,
      include_granted_scopes: "true",
    });

    const redirectLink = Env.GOOGLE_OAUTH2_ENDPOINT + "?" + params.toString();
    res.status(200).json({
      status: true,
      message: "Google Oauth2 url retrived successfully.",
      redirectLink,
    });
  } catch (error) {
    next(error);
  }
}

/* Google callback handler */
export async function googleCallbackHandler(req, res) {
  let flow = null;
  try {
    const { code, state, error } = req.query;
    flow = state;

    if (error || !code)
      throw new AppError(
        error,
        "An error occured in google prompt screen.",
        500,
        false,
      );

    const { accessToken, refreshToken } = await processGoogleCallbackReq(
      state,
      code,
    );

    res.cookie("refreshToken", refreshToken, Env.LOGIN_COOKIE_OPTS);
    res.redirect(
      `${Env.FRONTEND_URL}/oauth/google/callback?flow=${flow}&access_token=${accessToken}`,
    );
  } catch (error) {
    Logger.error(error);

    if (error.code === "access_denied")
      return res.redirect(
        `${Env.FRONTEND_URL}/oauth/google/callback?flow=${flow}&error=consent_cancelled`,
      );

    if (error.code === ErrorCodes.USER_ALREADY_EXISTS)
      return res.redirect(
        `${Env.FRONTEND_URL}/oauth/google/callback?flow=${flow}&error=user_already_exists`,
      );

    if (error.code === ErrorCodes.GOOGLE_NOT_LINKED)
      return res.redirect(
        `${Env.FRONTEND_URL}/oauth/google/callback?flow=${flow}&error=google_not_linked`,
      );

    if (error.code === ErrorCodes.USER_NOT_FOUND)
      return res.redirect(
        `${Env.FRONTEND_URL}/oauth/google/callback?flow=${flow}&error=user_not_found`,
      );

    res.redirect(
      `${Env.FRONTEND_URL}/oauth/google/callback?flow=${flow}&error=unexpected_error`,
    );
  }
}
