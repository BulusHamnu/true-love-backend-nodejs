import EmailTemplates from "../utils/emailTemplates.js";
import { formatAmount } from "../utils/helpers.js";
import User from "../models/user.model.js";
import AppError, { ErrorCodes } from "../errors/appError.js";
import Transaction from "../models/transaction.model.js";
import sendResendEmail from "./resend.js";
import { Env } from "../config/index.js";
import Logger from "../utils/logger.js";
import selfGuidedProgram from "../models/selfguidedProgram.model.js";

async function createSelfGuidedProgram(userId) {
  try {
    await selfGuidedProgram.create({ userId });
  } catch (error) {
    if (error.code === 11000)
      Logger.error("User already has selfGuidedProgram data.", error);

    Logger.error(
      `Error while creating selfGuidedProgram for user: ${userId}`,
      error,
    );
  }
}

/* Process stripe payment */
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
  Logger.info("New payment received.", {
    amount: formatAmount(amount),
    status,
    email,
    name,
    phone,
  });

  const user = await User.findOne({ email }).lean();
  if (!user) {
    throw new AppError(
      ErrorCodes.USER_NOT_FOUND,
      "User not found.",
      404,
      false,
    );
  }

  // Record transaction as source of truth.
  await Transaction.create({
    userId: user._id,
    amount,
    status: "paid",
    type: product,
    paymentIntent,
    receipt,
  });

  // Users unlock access to Self Guided Program module if they purchase self-guided-program but also unlock it as bonus if they purchase the coaching-program
  if (
    product === Env.SELF_GUIDED_PRODUCT_NAME ||
    product === Env.COACHING_PRODUCT_NAME
  ) {
    await createSelfGuidedProgram(user._id);
  }
}

export async function processPayment(data) {
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
  if (data.metadata.product === Env.SELF_GUIDED_PRODUCT_NAME) {
    await Promise.all([
      // Admin payment successful email for Self Guided Program
      sendResendEmail(
        Env.TOTUR_EMAIL,
        `Payment For True Love Self-Guided Program`,
        EmailTemplates.toturSelfGuidedTemplate(
          "David Prorok",
          data.customer_details?.name || "new user",
          data.customer_details?.email || "No Provided",
          formatAmount(data.amount_subtotal),
          `${new Date().toLocaleDateString()}`,
        ),
      ),
      // Customer confirmation email for Self Guided Program
      sendResendEmail(
        data.customer_details?.email,
        "Payment Successful",
        EmailTemplates.customerSelfGuidedTemplate(
          data.customer_details?.name || "Cupid’s pick",
        ),
      ),
    ]);
  }

  if (data.metadata.product === Env.COACHING_PRODUCT_NAME) {
    await Promise.all([
      // Admin payment successful email for Coaching Program
      sendResendEmail(
        Env.TOTUR_EMAIL,
        "Payment For True Love Transformation Program",
        EmailTemplates.toturCoachingTemplate(
          "David Prorok",
          data.customer_details?.name || "New user",
          data.customer_details?.email || "No Provided",
          formatAmount(data.amount_subtotal),
          `${new Date().toLocaleDateString()}`,
        ),
      ),
      // Customer confirmation email for Coaching Program
      sendResendEmail(
        data.customer_details?.email,
        "Payment Successful",
        EmailTemplates.customerCoachingTemplate(
          data.customer_details?.name || "Cupid’s pick",
        ),
      ),
    ]);
  }
}
