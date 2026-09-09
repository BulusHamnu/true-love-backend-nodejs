import { formatAmount } from "../utils/helpers.js";
import User from "../models/user.model.js";
import AppError, { ErrorCodes } from "../errors/appError.js";
import Transaction from "../models/transaction.model.js";
import { Env } from "../config/index.js";
import Logger from "../utils/logger.js";
import mainQueue from "../queues/main.queue.js";
import { createSelfGuidedProgram } from "./selfGuidedProgram.service.js";

/* Process stripe payment */
async function recordPayment({
  userId,
  email,
  amount,
  product,
  paymentIntent,
  status,
  name,
  phone,
  receipt,
  giveSelfGuidedAccess,
}) {
  Logger.info("New payment received.", {
    amount: formatAmount(amount),
    status,
    email,
    name,
    phone,
  });

  const user = await User.findOne({ _id: userId }).lean();
  if (!user) {
    throw new AppError(ErrorCodes.USER_NOT_FOUND, "User not found.", {
      status: 404,
      isOperational: true,
    });
  }

  // Record transaction as source of truth.
  try {
    await Transaction.create({
      userId: user._id,
      amount,
      status,
      type: product,
      paymentIntent,
      receipt,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("DUPLICATE_PAYEMNT_INTENT", "Duplicate transaction.", {
        status: 409,
        isOperational: false,
        cause: error,
      });
    }

    throw new AppError(
      ErrorCodes.UNEXPECTED_ERROR,
      "Failed to record transaction.",
      { status: 500, isOperational: false, cause: error },
    );
  }

  if (giveSelfGuidedAccess) {
    await createSelfGuidedProgram(user._id);
  }
}

export async function processPayment(
  { userId, ...data },
  giveSelfGuidedAccess,
) {
  await recordPayment({
    userId,
    email: data.customer_details?.email,
    amount: data.amount_subtotal,
    product: data.metadata.product,
    paymentIntent: data.payment_intent,
    status: data.payment_status,
    name: data.customer_details?.name,
    phone: data.customer_details?.phone,
    receipt: data.receipt_url,
    giveSelfGuidedAccess,
  });

  // Send confirmation email
  const toturEmail = Env.TOTUR_EMAIL;
  const customerEmail = data.customer_details?.email;
  const customerName = data.customer_details?.name || "New user";
  const productType = data.metadata.product;
  const amount = data.amount_subtotal;

  if (data.metadata.product === Env.SELF_GUIDED_PRODUCT_NAME) {
    await mainQueue.add(
      "totur-payment-email",
      {
        email: toturEmail,
        subject: "Payment For True Love Self-Guided Program",
        toturName: "David Prorok",
        amount,
        customerEmail,
        customerName,
        productType,
      },
      {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 3000,
        },
      },
    );
    //
    await mainQueue.add(
      "customer-payment-email",
      {
        email: customerEmail,
        subject: "Payment Successful",
        name: customerName,
        productType,
      },
      {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 3000,
        },
      },
    );
  }

  if (data.metadata.product === Env.COACHING_PRODUCT_NAME) {
    await mainQueue.add(
      "totur-payment-email",
      {
        email: toturEmail,
        subject: "Payment For True Love Transformation Program",
        toturName: "David Prorok",
        amount,
        customerEmail,
        customerName,
        productType,
      },
      {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 3000,
        },
      },
    );
    //
    await mainQueue.add(
      "customer-payment-email",
      {
        email: customerEmail,
        subject: "Payment Successful",
        name: customerName,
        productType,
      },
      {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 3000,
        },
      },
    );
  }
}
