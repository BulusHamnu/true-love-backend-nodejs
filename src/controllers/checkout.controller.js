import * as checkoutService from "../services/checkout.service.js";
import { checkoutBodySchema } from "../utils/validators.js";
import validateAndSanitizeData from "../utils/validateAndSanitizeData.js";
import Logger from "../utils/logger.js";
import AppError, { ErrorCodes } from "../errors/appError.js";

/* Create checkout handler */
function validateCheckoutBody(body) {
  return validateAndSanitizeData(body, checkoutBodySchema);
}

function validateIdempotencyKey(idempotencyKey) {
  if (
    idempotencyKey &&
    (idempotencyKey.length < 10 || idempotencyKey.length > 255)
  )
    throw new AppError(
      ErrorCodes.IDEMPOTENCY_KEY_INVALID,
      "Idempotency key must not be less than 100 or greater than 255 character long.",
      400,
      false,
    );
}

export async function createCheckOutHandler(req, res, next) {
  try {
    const user = req.user;
    const idempotencyKey = req.headers["idempotency-key"];
    
    validateIdempotencyKey(idempotencyKey);

    const { product, newDoor } = validateCheckoutBody(req.body);
    Logger.info(`${product} checkout initiated`, {
      customerEmail: user.email,
    });

    const result = await checkoutService.createCheckout({
      user,
      product,
      newDoor,
      idempotencyKey,
      requestBody: {
        product,
        newDoor,
      },
    });

    res.status(200).json({ status: true, data: result });
  } catch (error) {
    next(error);
  }
}
