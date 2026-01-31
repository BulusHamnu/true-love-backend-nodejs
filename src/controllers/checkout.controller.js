import { validateCheckoutBody } from "../utils/validators.js";
import * as checkoutService from "../services/checkout.service.js";
import Logger from "../utils/logger.js";

/* Create checkout handler */
export async function createCheckOutHandler(req, res, next) {
  try {
    const { product, newDoor } = validateCheckoutBody(req.body);
    const user = req.user;

    Logger.info(`${product} checkout requested`, {
      customerEmail: user.email,
    });
    const sessionUrl = await checkoutService.createCheckout(
      user,
      product,
      newDoor,
    );

    res.status(200).json({ status: true, data: { url: sessionUrl } });
  } catch (error) {
    next(error);
  }
}
