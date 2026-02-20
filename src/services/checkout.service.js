import AppError, { ErrorCodes } from "../errors/appError.js";
import Profile from "../models/profile.model.js";
import Env, { StripeClient } from "../config/index.js";
import Transaction from "../models/transaction.model.js";

/* Create checkout function */
// Create StripeClient customer
export async function get0rCreateStripeCustomerId({
  fullName,
  email,
  phone,
  userId,
  StripeClientCustomerId,
}) {
  if (StripeClientCustomerId) {
    return StripeClientCustomerId;
  }

  const customer = await StripeClient.customers.create({
    name: fullName,
    email,
    phone,
  });

  await Profile.findOneAndUpdate(
    { userId },
    { StripeClientCustomerId: customer.id },
    { new: true },
  );

  return customer.id;
}

// create StripeClient session
export async function createStripeSession(
  StripeClientCustomerId,
  product,
  newDoor = false,
) {
  let priceId;
  let successUrl;
  let errorUrl;
  let allowCoupon;

  if (product === Env.SELF_GUIDED_PRODUCT_NAME) {
    priceId = Env.SELF_GUIDED_PRICE_ID;
    successUrl = `${Env.FRONTEND_URL}/self-guided-success`;
    errorUrl = `${Env.FRONTEND_URL}/self-guided-error`;
    allowCoupon = true;
  }

  if (product === Env.COACHING_PRODUCT_NAME) {
    priceId = newDoor ? Env.NEWDOOR_COACHING_PRICE_ID : Env.COACHING_PRICE_ID;
    successUrl = `${Env.FRONTEND_URL}/success`;
    errorUrl = `${Env.FRONTEND_URL}/error`;
    allowCoupon = false;
  }

  const session = await StripeClient.checkout.sessions.create({
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    allow_promotion_codes: allowCoupon,
    customer: StripeClientCustomerId,
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
  const transactions = await Transaction.find({ userId: user.id }).lean();
  const userPurchases = transactions.map((transaction) => transaction.type);

  if (
    product === Env.SELF_GUIDED_PRODUCT_NAME &&
    (userPurchases.includes(Env.SELF_GUIDED_PRODUCT_NAME) ||
      userPurchases.includes(Env.COACHING_PRODUCT_NAME))
  ) {
    throw new AppError(
      ErrorCodes.SELFGUIDED_ALREADY_PURCHASED,
      "User already paid for the Self-guided Program.",
      409,
      true,
      { email: user.email, paidForSelfGuidedProgram: true },
    );
  }

  if (
    product === Env.COACHING_PRODUCT_NAME &&
    userPurchases.includes(Env.COACHING_PRODUCT_NAME)
  ) {
    throw new AppError(
      ErrorCodes.COACHING_ALREADY_PURCHASED,
      "User already paid for the Coaching Program.",
      409,
      true,
      { email: user.email, paidForCoachingProgram: true },
    );
  }

  const StripeClientCustomerId = await get0rCreateStripeCustomerId({
    ...user,
    userId: user._id,
  });

  const sessionUrl = await createStripeSession(
    StripeClientCustomerId,
    product,
    newDoor,
  );

  return sessionUrl;
}
