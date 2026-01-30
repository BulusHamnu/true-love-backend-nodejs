import { env, stripe } from "../config/index.js";
import Profile from "../models/profile.model.js";
import { templates } from "../services/email.js";
import sendResendEmail from "../services/resend.js";
import { formatAmount, logger } from "../utils/helpers.js";
import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";
import AppError, { ErrorCodes } from "../errors/appError.js";
import { validateCheckoutBody } from "../utils/validators.js";

/* Create checkout function */
// Create stripe customer
export async function get0rCreateStripeCustomerId({
  fullName,
  email,
  phone,
  userId,
  stripeCustomerId,
}) {
  if (stripeCustomerId) {
    return stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    name: fullName,
    email,
    phone,
  });

  await Profile.findOneAndUpdate(
    { userId },
    { stripeCustomerId: customer.id },
    { new: true },
  );

  return customer.id;
}

// create stripe session
async function createStripeSession(stripeCustomerId, product, newDoor = false) {
  let priceId;
  let successUrl;
  let errorUrl;
  let allowCoupon;

  if (product === "self-guided-program") {
    priceId = env.SELF_GUIDED_PRICE_ID;
    successUrl = `${env.FRONTEND_URL}/self-guided-success`;
    errorUrl = `${env.FRONTEND_URL}/self-guided-error`;
    allowCoupon = true;
  }

  if (product === "coaching-program") {
    priceId = newDoor ? env.NEWDOOR_COACHING_PRICE_ID : env.COACHING_PRICE_ID;
    successUrl = `${env.FRONTEND_URL}/success`;
    errorUrl = `${env.FRONTEND_URL}/error`;
    allowCoupon = false;
  }

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    allow_promotion_codes: allowCoupon,
    customer: stripeCustomerId,
    phone_number_collection: { enabled: true },
    mode: "payment",
    success_url: successUrl,
    cancel_url: errorUrl,
    automatic_tax: { enabled: false },
    metadata: {
      site: "true-love-app",
      product,
    },
  });

  return session.url;
}

export async function createCheckOut(req, res, next) {
  try {
    const { product, newDoor } = validateCheckoutBody(req.body);
    const user = req.user;

    logger.info(`${product} checkout requested`, {
      customerEmail: user.email,
    });

    if (product === "self-guided-program" && user.hasPremium === true) {
      throw new AppError(
        ErrorCodes.SELFGUIDED_ALREADY_PURCHASED,
        "User already paid for the Self-guided Program.",
        409,
        true,
        { email, hasPremium: true },
      );
    }

    if (product === "coaching-program" && user.paidForCoaching === true) {
      throw new AppError(
        ErrorCodes.COACHING_ALREADY_PURCHASED,
        "User already paid for the Coaching Program.",
        409,
        true,
        { email, paidForCoaching: true },
      );
    }

    const stripeCustomerId = await get0rCreateStripeCustomerId({
      ...user,
      userId: user._id,
    });

    const sessionUrl = await createStripeSession(
      stripeCustomerId,
      product,
      newDoor,
    );

    res.status(200).json({ status: true, data: { url: sessionUrl } });
  } catch (error) {
    next(error);
  }
}

/* Stripe webhook handler */
async function recordPayment({
  email,
  amount,
  product,
  paymentIntent,
  status,
  name,
  phone,
  receipt,
}) {
  logger.info("New payment received.", {
    amount: formatAmount(amount),
    status,
    email,
    name,
    phone,
  });

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(
      ErrorCodes.USER_NOT_FOUND,
      "User not found.",
      404,
      false,
    );
  }

  // Save transaction record
  const newTransaction = await Transaction.create({
    userId: user._id,
    amount,
    status: "paid",
    type: product,
    paymentIntent,
    receipt,
  });

  /* 
    Check the product type to know what to update
    mark hasPremium if user purchase the self-guided-program
    mark hasPremium & paidForCoaching if user purchased the coaching-program package
  */
  const updates =
    product === "self-guided-program"
      ? { hasPremium: true }
      : { paidForCoaching: true, hasPremium: true };

  await Profile.findOneAndUpdate(
    { userId: user._id },
    {
      $set: updates,
      $push: { transactions: newTransaction._id },
    },
    { new: true },
  );
}

export async function paymentSucessful(req, res) {
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
    const event = stripe.webhooks.constructEvent(
      rawBody,
      stripeSig,
      env.STRIPE_WEBHOOK_SECRET_KEY,
    );

    if (event.type !== "checkout.session.completed") {
      return res.status(200).send("Event received.");
    }

    const data = event.data.object;
    logger.info("Stripe webhook received.", { eventType: event.type });

    if (data.metadata.site !== "true-love-app") {
      logger.info("Event does not belong to the app.");
      return res.status(200).send("Event received.");
    }

    await recordPayment({
      email: data.customer_details?.email,
      amount: data.amount_subtotal,
      product: data.metadata.product,
      paymentIntent: data.payment_intent,
      status: data.payment_status,
      name: data.customer_details?.name,
      phone: data.customer_details?.phone,
      receipt: data.receipt_url,
    });

    // Send confirmation email
    if (data.metadata.product === "self-guided-program") {
      await sendResendEmail(
        env.TOTUR_EMAIL,
        `Payment For True Love Self-Guided Program`,
        templates.selfGuidedtutorTemplate(
          "David Prorok",
          data.customer_details?.name || "new user",
          data.customer_details?.email || "No Provided",
          formatAmount(data.amount_subtotal),
          `${new Date().toLocaleDateString()}`,
        ),
      );

      await sendResendEmail(
        data.customer_details?.email,
        "Payment Successful",
        templates.selfGuidedCustomerTemplate(
          data.customer_details?.name || "Cupid’s pick",
        ),
      );
    }

    if (data.metadata.product === "coaching-program") {
      await sendResendEmail(
        env.TOTUR_EMAIL,
        "Payment For True Love Transformation Program",
        templates.tutorTemplate(
          "David Prorok",
          data.customer_details?.name || "New user",
          data.customer_details?.email || "No Provided",
          formatAmount(data.amount_subtotal),
          `${new Date().toLocaleDateString()}`,
        ),
      );

      await sendResendEmail(
        data.customer_details?.email,
        "Payment Successful",
        templates.coachingTemplate(
          data.customer_details?.name || "Cupid’s pick",
        ),
      );
    }

    res.status(200).send("Event received.");
  } catch (error) {
    logger.error(error);
    res.status(400);
  }
}
