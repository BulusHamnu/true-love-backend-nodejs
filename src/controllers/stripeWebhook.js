import AppError, { ErrorCodes } from "../errors/appError.js";
import Env, { StripeClient } from "../config/index.js";
import Logger from "../utils/logger.js";
import { processPayment } from "../services/processPayment.js";
import mongoose from "mongoose";

/* Stripe webhook handler */
export default async function stripeWebhookHandler(req, res) {
  let giveSelfGuidedAccess = null;
  let userId = undefined;
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

    userId = eventObj.metadata?.userId
      ? new mongoose.Types.ObjectId(eventObj.metadata.userId)
      : undefined;

    // Users unlock access to Self Guided Program module if they purchase self-guided-program but also unlock it as bonus if they purchase the coaching-program; And we initiate it here because this webhook is the only service that create it.
    const product = eventObj.metadata.product;
    giveSelfGuidedAccess =
      product === Env.SELF_GUIDED_PRODUCT_NAME ||
      product === Env.COACHING_PRODUCT_NAME;

    await processPayment({ userId, ...eventObj }, giveSelfGuidedAccess);
    res.status(200).send("Event received.");
  } catch (error) {
    if (error.code === "DUPLICATE_PAYEMNT_INTENT")
      return res.status(200).send("Event already processed.");

    if (giveSelfGuidedAccess) {
      await createSelfGuidedProgram(userId);
    }

    Logger.error(error);
    res.status(400).send("An error occured.");
  }
}
