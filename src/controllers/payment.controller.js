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

// Get user profile
async function getProfile(userId) {
  const userProfile = await Profile.findOne({ userId }).lean();
  if (!userProfile) {
    throw new AppError(
      ErrorCodes.PROFILE_NOT_FOUND,
      "Profile not found.",
      404,
      true,
    );
  }
  return userProfile;
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
    const userProfile = await getProfile(user?._id);

    logger.info(`${product} checkout requested`, {
      customerEmail: user.email,
    });

    if (product === "self-guided-program" && userProfile.hasPremium === true) {
      throw new AppError(
        ErrorCodes.SELFGUIDED_ALREADY_PURCHASED,
        "User already paid for the Self-guided Program.",
        409,
        true,
        { email, hasPremium: true },
      );
    }

    if (
      product === "coaching-program" &&
      userProfile.paidForCoaching === true
    ) {
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
      ...userProfile,
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

// create checkout endpoint
// export async function oldCreateCheckOut(req, res) {
//   try {
//     const user = req.user;
//     const userProfile = await getProfile(user?._id);

//     if (userProfile.paidForCoaching === true)
//       return res.status(409).json({
//         status: true,
//         message: "User already paid for the coaching-program.",
//       });

//     if (!customerId) {
//       customerId = await createStripeCustomer(userProfile);
//     }

//     // create stripe checkout
//     const session = await stripe.checkout.sessions.create({
//       line_items: [
//         {
//           price: env.PRODUCT_PRICE_ID,
//           quantity: 1,
//         },
//       ],
//       // customer details
//       customer: customerId,
//       phone_number_collection: { enabled: true },
//       mode: "payment",
//       success_url: `${env.FRONTEND_URL}/success`,
//       cancel_url: `${env.FRONTEND_URL}/error`,
//       automatic_tax: { enabled: false },
//       metadata: {
//         site: "true-love",
//       },
//     });

//     logger.info("Checkout for coaching program requested", {
//       customerId: customerId,
//       customerEmail: userProfile.email,
//     });

//     res.status(200).json({ status: true, data: { url: session.url } });
//   } catch (error) {
//     logger.error(error);

//     res.status(500).json({
//       status: false,
//       message: "An error occur.",
//     });
//   }
// }

/* Stripe webhook handler */
export async function paymentSucessful(req, res) {
  try {
    const rawBody = req.body;
    const sig = req.headers["stripe-signature"];

    // construct stripe event for signature
    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      env.STRIPE_WEBHOOK_SECRET_KEY,
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
          { new: true },
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
          `${new Date().toLocaleDateString()}`,
        ),
      );

      // for customer
      await sendResendEmail(
        data.customer_details?.email,
        "Payment Successful",
        templates.selfGuidedCustomerTemplate(
          data.customer_details?.name || "cupid’s pick",
        ),
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
          { new: true },
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
          `${new Date().toLocaleDateString()}`,
        ),
      );

      // for customer
      await sendResendEmail(
        data.customer_details?.email,
        "Payment Successful",
        templates.customerTemplate(
          data.customer_details?.name || "cupid’s pick",
        ),
      );
    }

    res.send();
  } catch (error) {
    logger.error(error);
    res.status(400);
  }
}

// create checkout new-door
// export async function createCheckOutNewdoor(req, res) {
//   try {
//     const userProfile = req.userProfile;
//     let customerId = userProfile.stripeCustomerId;

//     if (userProfile.paidForCoaching === true)
//       return res.status(409).json({
//         status: true,
//         message: "User already paid for the coaching-program.",
//       });

//     if (!customerId) {
//       customerId = await createStripeCustomer(userProfile);
//     }

//     // create stripe checkout
//     const session = await stripe.checkout.sessions.create({
//       line_items: [
//         {
//           price: req.body.priceId || PRODUCT_PRICE_ID_NEW_DOOR,
//           quantity: 1,
//         },
//       ],
//       // customer details
//       customer: customerId,
//       phone_number_collection: { enabled: true },
//       mode: "payment",
//       success_url: `${env.FRONTEND_URL}/success`,
//       cancel_url: `${env.FRONTEND_URL}/error`,
//       automatic_tax: { enabled: false },
//       metadata: {
//         site: "true-love",
//       },
//     });

//     logger.info("Checkout for coaching program requested", {
//       customerId: customerId,
//       customerEmail: userProfile.email,
//     });

//     res.status(200).json({ status: true, data: { url: session.url } });
//   } catch (error) {
//     logger.error(error);

//     res.status(500).json({
//       status: false,
//       message: "An error occur.",
//     });
//   }
// }
