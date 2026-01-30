import AppError, { ErrorCodes } from "../errors/appError.js";
import Profile from "../models/profile.model.js";
import { stripe, env } from "../config/index.js";

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
export async function createStripeSession(
  stripeCustomerId,
  product,
  newDoor = false,
) {
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

export async function createCheckout(user, product, newDoor) {
  if (product === "self-guided-program" && user.hasPremium === true) {
    throw new AppError(
      ErrorCodes.SELFGUIDED_ALREADY_PURCHASED,
      "User already paid for the Self-guided Program.",
      409,
      true,
      { email: user.email, hasPremium: true },
    );
  }

  if (product === "coaching-program" && user.paidForCoaching === true) {
    throw new AppError(
      ErrorCodes.COACHING_ALREADY_PURCHASED,
      "User already paid for the Coaching Program.",
      409,
      true,
      { email: user.email, paidForCoaching: true },
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

  return sessionUrl;
}
