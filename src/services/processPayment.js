import EmailTemplates from "../utils/emailTemplates.js";
import { logger, formatAmount } from "../utils/helpers.js";
import User from "../models/user.model.js";
import AppError, { ErrorCodes } from "../errors/appError.js";
import Transaction from "../models/transaction.model.js";
import Profile from "../models/profile.model.js";
import sendResendEmail from "./resend.js";
import { env } from "../config/index.js";

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
  if (data.metadata.product === "self-guided-program") {
    await sendResendEmail(
      env.TOTUR_EMAIL,
      `Payment For True Love Self-Guided Program`,
      EmailTemplates.toturSelfGuidedTemplate(
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
      EmailTemplates.customerSelfGuidedTemplate(
        data.customer_details?.name || "Cupid’s pick",
      ),
    );
  }

  if (data.metadata.product === "coaching-program") {
    await sendResendEmail(
      env.TOTUR_EMAIL,
      "Payment For True Love Transformation Program",
      EmailTemplates.toturCoachingTemplate(
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
      EmailTemplates.customerCoachingTemplate(
        data.customer_details?.name || "Cupid’s pick",
      ),
    );
  }
}
