import AppError, { ErrorCodes } from "../errors/appError.js";
import Env, { StripeClient, } from "../config/index.js";
import { logger } from "../utils/helpers.js";
import { processPayment } from "../services/processPayment.js";

/* Stripe webhook handler */
export default async function stripeWebhookHandler(req, res) {
  try {
    const rawBody = req.body;
    const stripeSig = req.headers["stripe-signature"];
    if (!stripeSig) {
      throw new AppError(
        ErrorCodes.STRIPE_SIGNATURE_NOT_FOUND,
        "Stripe signature not found",
        400,
        true,
      );
    }

    // To verify if event is from stripe
    const event = StripeClient.webhooks.constructEvent(
      rawBody,
      stripeSig,
      Env.STRIPE_WEBHOOK_SECRET_KEY,
    );

    if (event.type !== "checkout.session.completed") {
      return res.status(200).send("Event received.");
    }

    const eventObj = event.data.object;
    logger.info("Stripe webhook received.", { eventType: event.type });

    if (eventObj.metadata.site !== "true-love-app") {
      logger.info("Event does not belong to the app.");
      return res.status(200).send("Event received.");
    }

    await processPayment(eventObj);
    res.status(200).send("Event received.");
  } catch (error) {
    logger.error(error);
    res.status(400);
  }
}
