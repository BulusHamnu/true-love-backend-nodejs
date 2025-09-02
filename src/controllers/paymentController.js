import { env, stripe } from "../../confiq/index.js";
import Profile from "../models/profile.js";
import { templates, sendEmail } from "../services/email.js";
import sendResendEmail from "../services/resend.js";
import { formatAmount, logError, logInfo } from "../utils/helpers.js";
import Transaction from "../models/transactions.js";
import User from "../models/user.js";

// create checkout endpoint
export async function createSelfGuidedCheckOut(req, res) {
  const userProfile = req.userProfile;
  try {
    if (userProfile.hasPremium === true)
      return res.status(409).json({
        status: true,
        message: "User already paid for the self-guided program.",
      });

    // create stipe customer
    const customer = await stripe.customers.create({
      name: userProfile.fullName || "",
      email: userProfile.email || "",
      phone: userProfile.phone || "",
    });

    // create stripe checkout
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: env.SELF_GUIDED_PRICE_ID,
          quantity: 1,
        },
      ],
      // customer details
      customer: customer.id,
      phone_number_collection: { enabled: true },
      mode: "payment",
      success_url: `${env.FRONTEND_URL}/self-guided-success`,
      cancel_url: `${env.FRONTEND_URL}/self-guided-error`,
      automatic_tax: { enabled: false },
      metadata: {
        site: "self-guided-true-love",
      },
    });

    // res.redirect(session.url)
    res.status(200).json({ status: true, data: { url: session.url } });
  } catch (error) {
    logError(
      `An error occur creating stripe chechout for self-guided part`,
      error.message
    );

    res.status(500).json({
      status: false,
      message: "An error occur.",
      error: error.message,
    });
  }
}

// create checkout endpoint
export async function createCheckOut(req, res) {
  try {
    const userProfile = req.userProfile;
    if (userProfile.paidForCoaching === true)
      return res.status(409).json({
        status: true,
        message: "User already paid for the coaching-program.",
      });

    // create stipe customer
    const customer = await stripe.customers.create({
      name: userProfile.fullName || "",
      email: userProfile.email || "",
      phone: userProfile.phone || "",
    });

    // create stripe checkout
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: env.PRODUCT_PRICE_ID,
          quantity: 1,
        },
      ],
      // customer details
      customer: customer.id,
      phone_number_collection: { enabled: true },
      mode: "payment",
      success_url: `${env.FRONTEND_URL}/success`,
      cancel_url: `${env.FRONTEND_URL}/error`,
      automatic_tax: { enabled: false },
      metadata: {
        site: "true-love",
      },
    });

    // res.redirect(session.url)
    res.status(200).json({ status: true, data: { url: session.url } });
  } catch (error) {
    logError(`An error occur creating chechout.`, error.message);

    res.status(500).json({
      status: false,
      message: "An error occur.",
      error: error.message,
    });
  }
}

// stripe webhook
export async function paymentSucessful(req, res) {
  try {
    const rawBody = req.body;
    const sig = req.headers["stripe-signature"];

    // construct stripe event for signature
    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      env.STRIPE_WEBHOOK_SECRET_KEY
    );

    const data = event.data.object;
    if (
      event.type === "checkout.session.completed" &&
      data.metadata.site === "self-guided-true-love"
    ) {
      const logs = [
        data.amount_subtotal,
        formatAmount(data.payment_status),
        data.customer_details?.email,
        data.customer_details?.name,
        data.customer_details?.phone,
      ].join(" ");

      logInfo("New payment submited for self-guided version!", logs);

      // add the transaction
      const user = await User.findOne({ email: data.customer_details?.email });

      // if user exist saved the transaction record
      if (user) {
        const newTransaction = await Transaction.create({
          userId: user._id,
          amount: data.amount_subtotal,
          status: "paid",
          type: "self-guided-program",
          paymentIntent: data.payment_intent,
          receipt: data.receipt_url,
        });

        // find users profile and update payment status
        await Profile.findOneAndUpdate(
          { userId: user._id },
          {
            $set: { hasPremium: true },
            $push: { transactions: newTransaction._id },
          },
          { new: true }
        );
      }

      // send confirmation emails
      // for tutor
      await sendResendEmail(
        env.TOTUR_EMAIL,
        "Payment For True Love Self-Guided Version",
        templates.selfGuidedUserTemplate(
          "David Prorok",
          data.customer_details?.name || "new user",
          data.customer_details?.email || "No Provided",
          formatAmount(data.amount_subtotal)
        )
      );

      // for customer
      await sendResendEmail(
        data.customer_details?.email || "cupid’s pick",
        "Payment Successful",
        templates.selfGuidedCustomerTemplate(
          data.customer_details?.name || "No Provided",
          formatAmount(data.amount_subtotal)
        )
      );
    } else if (
      event.type === "checkout.session.completed" &&
      data.metadata.site === "true-love"
    ) {
      const logs = [
        data.amount_subtotal,
        formatAmount(data.payment_status),
        data.customer_details?.email,
        data.customer_details?.name,
        data.customer_details?.phone,
      ].join(" ");

      logInfo("New payment submited!", logs);

      // add the transaction
      const user = await User.findOne({ email: data.customer_details?.email });

      // if user exist saved the transaction record
      if (user) {
        const newTransaction = await Transaction.create({
          userId: user._id,
          amount: data.amount_subtotal,
          status: "paid",
          type: "coaching-program",
          paymentIntent: data.payment_intent,
          receipt: data.receipt_url,
        });

        // find users profile and update payment status
        await Profile.findOneAndUpdate(
          { userId: user._id },
          {
            $set: { paidForCoaching: true, hasPremium: true },
            $push: { transactions: newTransaction._id },
          },
          { new: true }
        );
      }

      // send confirmation emails
      // for tutor
      await sendResendEmail(
        env.TOTUR_EMAIL,
        "Payment For True Love Transformation Program",
        templates.userTemplate(
          "David Prorok",
          data.customer_details?.name || "No Provided",
          data.customer_details?.email || "No Provided",
          formatAmount(data.amount_subtotal)
        )
      );

      // for customer
      await sendResendEmail(
        data.customer_details?.email || "No Provided",
        "Payment Successful",
        templates.customerTemplate(
          data.customer_details?.name || "No Provided",
          formatAmount(data.amount_subtotal)
        )
      );
    }

    res.send();
  } catch (error) {
    logError("An error occur in the webhook.", error);
    res.status(500).json({
      status: false,
      messaseg: "An error occur.",
      error: error.message,
    });
  }
}
