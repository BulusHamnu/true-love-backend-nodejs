import { env, stripe } from "../../confiq/index.js";
import Profile from "../models/profile.js";
import { templates, sendEmail } from "../services/email.js";
import sendResendEmail from "../services/resend.js";
import {
  formatAmount,
  logger,
  createStripeCustomer,
} from "../utils/helpers.js";
import Transaction from "../models/transactions.js";
import User from "../models/user.js";

// create checkout endpoint
export async function createSelfGuidedCheckOut(req, res) {
  const userProfile = req.userProfile;
  let customerId = userProfile.stripeCustomerId;
  try {
    if (userProfile.hasPremium === true)
      return res.status(409).json({
        status: true,
        message: "User already paid for the self-guided program.",
      });

    if (!customerId) {
      customerId = await createStripeCustomer(userProfile);
    }

    // get coupon
    const coupons = [];
    if (req.body.coupon) {
      coupons.push({
        coupon: req.body.coupon,
      });
    }

    // create stripe checkout
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: env.SELF_GUIDED_PRICE_ID,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      // customer details
      customer: customerId,
      phone_number_collection: { enabled: true },
      mode: "payment",
      success_url: `${env.FRONTEND_URL}/self-guided-success`,
      cancel_url: `${env.FRONTEND_URL}/self-guided-error`,
      automatic_tax: { enabled: false },
      metadata: {
        site: "self-guided-true-love",
      },
    });

    logger.info("Checkout for self-guided program requested", {
      customerId: customerId,
      customerEmail: userProfile.email,
    });

    // res.redirect(session.url)
    res.status(200).json({ status: true, data: { url: session.url } });
  } catch (error) {
    logger.error(error);
    if (error.message.includes("No such coupon"))
      return res.status(400).json({
        status: false,
        message: "Coupon is invalid or not available.",
      });
    res.status(500).json({
      status: false,
      message: "An error occur.",
    });
  }
}

// create checkout endpoint
export async function createCheckOut(req, res) {
  try {
    const userProfile = req.userProfile;
    let customerId = userProfile.stripeCustomerId;

    if (userProfile.paidForCoaching === true)
      return res.status(409).json({
        status: true,
        message: "User already paid for the coaching-program.",
      });

    if (!customerId) {
      customerId = await createStripeCustomer(userProfile);
    }

    // create stripe checkout
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: env.PRODUCT_PRICE_ID,
          quantity: 1,
        },
      ],
      // customer details
      customer: customerId,
      phone_number_collection: { enabled: true },
      mode: "payment",
      success_url: `${env.FRONTEND_URL}/success`,
      cancel_url: `${env.FRONTEND_URL}/error`,
      automatic_tax: { enabled: false },
      metadata: {
        site: "true-love",
      },
    });

    logger.info("Checkout for coaching program requested", {
      customerId: customerId,
      customerEmail: userProfile.email,
    });

    res.status(200).json({ status: true, data: { url: session.url } });
  } catch (error) {
    logger.error(error);

    res.status(500).json({
      status: false,
      message: "An error occur.",
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
    logger.info("Stripe webhook received.", { paymentEventType: data.type });

    if (
      event.type === "checkout.session.completed" &&
      data.metadata.site === "self-guided-true-love"
    ) {
      logger.info("New payment submited for self-guided version!", {
        amount: formatAmount(data.amount_subtotal),
        status: data.payment_status,
        email: data.customer_details?.email,
        name: data.customer_details?.name,
        phoneNo: data.customer_details?.phone,
      });

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
        templates.selfGuidedtutorTemplate(
          "David Prorok",
          data.customer_details?.name || "new user",
          data.customer_details?.email || "No Provided",
          formatAmount(data.amount_subtotal),
          `${new Date().toLocaleDateString()}`
        )
      );

      // for customer
      await sendResendEmail(
        data.customer_details?.email,
        "Payment Successful",
        templates.selfGuidedCustomerTemplate(
          data.customer_details?.name || "cupid’s pick"
        )
      );
    } else if (
      event.type === "checkout.session.completed" &&
      data.metadata.site === "true-love"
    ) {
      logger.info("New payment submited for self-guided version!", {
        amount: formatAmount(data.amount_subtotal),
        status: data.payment_status,
        email: data.customer_details?.email,
        name: data.customer_details?.name,
        phoneNo: data.customer_details?.phone,
      });

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
        templates.tutorTemplate(
          "David Prorok",
          data.customer_details?.name || "new user",
          data.customer_details?.email || "No Provided",
          formatAmount(data.amount_subtotal),
          `${new Date().toLocaleDateString()}`
        )
      );

      // for customer
      await sendResendEmail(
        data.customer_details?.email,
        "Payment Successful",
        templates.customerTemplate(
          data.customer_details?.name || "cupid’s pick"
        )
      );
    }

    res.send();
  } catch (error) {
    logger.error(error);
    /* res.status(500).json({
      status: false,
      messaseg: "An error occur.",
      error: error.message,
    }); */
  }
}
