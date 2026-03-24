import AppError, { ErrorCodes } from "../errors/appError.js";
import Env, { StripeClient } from "../config/index.js";
import Logger from "../utils/logger.js";
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

    const webhookSecret =
      Env.NODE_ENV === "production"
        ? Env.STRIPE_WEBHOOK_SECRET_KEY_LIVE
        : Env.STRIPE_WEBHOOK_SECRET_KEY_TEST;

    let event = StripeClient.webhooks.constructEvent(
      rawBody,
      stripeSig,
      webhookSecret,
    );

    if (event.type !== "checkout.session.completed") {
      return res.status(200).send("Event received.");
    }

    const eventObj = event.data.object;
    Logger.info("Stripe webhook received.", { eventType: event.type });

    if (eventObj.metadata.site !== "true-love-app") {
      Logger.info("Event does not belong to the app.");
      return res.status(200).send("Event received.");
    }

    await processPayment(eventObj);
    res.status(200).send("Event received.");
  } catch (error) {
    if (error.code === "DUPLICATE_PAYEMNT_INTENT")
      return res.status(200).send("Event already processed.");

    Logger.error(error);
    res.status(400).send("An error occured.");
  }
}
