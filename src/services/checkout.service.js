import AppError, { ErrorCodes } from "../errors/appError.js";
import Profile from "../models/profile.model.js";
import Env, { StripeClient } from "../config/index.js";
import Transaction from "../models/transaction.model.js";
import IdempotencyKey from "../models/idempotency_key.model.js";
import crypto from "crypto";

/* Create checkout function */
export async function retriveOrCreateStripeCustomerId({ userId, email }) {
  const userProfile = await Profile.findOne({ userId }).lean();
  if (userProfile.stripeCustomerId) {
    return userProfile.stripeCustomerId;
  }

  const customer = await StripeClient.customers.create({
    name: userProfile.fullName,
    email,
    phone: userProfile.phone,
  });

  await Profile.findOneAndUpdate(
    { _id: userProfile._id },
    { $set: { stripeCustomerId: customer.id } },
  );

  return customer.id;
}

export async function createStripeSession(
  stripeCustomerId,
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

function generateRequestHash(data) {
  const sortedRequestData = Object.keys(data)
    .sort()
    .reduce((obj, key) => {
      obj[key] = data[key];
      return obj;
    }, {});

  return crypto
    .createHash("sha256")
    .update(JSON.stringify(sortedRequestData))
    .digest("hex");
}

async function checkAndValidateIdempotencyRecord(
  userId,
  idempotencyKey,
  requestBody,
) {
  if (!idempotencyKey) return null;

  const idempotencyRecord = await IdempotencyKey.findOne({
    userId,
    key: idempotencyKey,
  });

  if (!idempotencyRecord) return null;

  const requestHash = generateRequestHash(requestBody);
  const sameReq = requestHash === idempotencyRecord.requestHash;
  if (!sameReq)
    throw new AppError(
      ErrorCodes.IDEMPOTENCY_KEY_ERROR,
      "The same idempotency key used for different request body.",
      400,
      false,
      { idempotencyKey },
    );

  const isExpired = new Date(idempotencyRecord.expiresAt) < new Date();
  if (isExpired) return null;

  return idempotencyRecord;
}

export async function createCheckout({
  user,
  product,
  newDoor,
  idempotencyKey,
  requestBody,
}) {
  const result = await checkAndValidateIdempotencyRecord(
    user.id,
    idempotencyKey,
    requestBody,
  );
  if (result) return result.responseBody;

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

  const stripeCustomerId = await retriveOrCreateStripeCustomerId({
    userId: user.id,
    email: user.email,
  });

  const sessionUrl = await createStripeSession(
    stripeCustomerId,
    product,
    newDoor,
  );

  if (idempotencyKey) {
    try {
      const requestHash = generateRequestHash(requestBody);
      await IdempotencyKey.create({
        key: idempotencyKey,
        userId: user.id,
        status: "success",
        responseBody: {
          url: sessionUrl,
        },
        requestHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    } catch (error) {
      if (error.code === 11000) {
        const result = await checkAndValidateIdempotencyRecord(
          user.id,
          idempotencyKey,
          requestBody,
        );
        if (result) return result.responseBody;
      }

      throw error;
    }
  }

  return sessionUrl;
}
