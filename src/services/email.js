import nodemailer from "nodemailer";
import { env } from "../../confiq/index.js";

// nodemailer config
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: env.EMAIL,
    pass: env.EMAIL_PASSWORD,
  },
});

// create email function
export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"True Love Transformation" <${env.EMAIL}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

// email template
export const templates = {
  // default template self confirmation
  tutorTemplate: (
    tutor_name,
    customer_name,
    customer_email,
    amount_paid,
    payment_date
  ) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>New Coaching Payment Notification</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f9f9f9;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #1a1a1a;
              color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              text-align: center;
            }
            .header-title {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #ff6b35;
            }
            .header-subtitle {
              font-size: 16px;
              opacity: 0.9;
            }
            .content {
              background-color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              margin-top: 20px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .main-title {
              color: #1a1a1a;
              font-size: 22px;
              margin-bottom: 20px;
              text-align: center;
            }
            .payment-details {
              background-color: #fff3f0;
              padding: 25px;
              border-radius: 8px;
              border: 2px solid #ff6b35;
              margin-bottom: 25px;
            }
            .payment-title {
              color: #ff6b35;
              font-size: 20px;
              margin-bottom: 15px;
              margin-top: 0;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
              flex-wrap: wrap; /* allows stacking on small screens */
            }
            .detail-label {
              font-weight: bold;
              color: #333;
            }
            .detail-value {
              color: #666;
            }
            .amount {
              font-size: 24px;
              font-weight: bold;
              color: #ff6b35;
            }
            .next-steps {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 6px;
              margin-bottom: 25px;
            }
            .steps-title {
              color: #ff6b35;
              margin-top: 0;
              margin-bottom: 15px;
            }
            .steps-list {
              padding-left: 20px;
              margin-bottom: 0;
            }
            .steps-list li {
              margin-bottom: 10px;
            }
            .quote-section {
              background-color: #e8f5e8;
              padding: 20px;
              border-radius: 6px;
              text-align: center;
              margin-bottom: 20px;
            }
            .quote-title {
              color: #2d5a2d;
              margin-top: 0;
              margin-bottom: 10px;
            }
            .quote-text {
              margin: 0;
              font-size: 16px;
              color: #2d5a2d;
              font-style: italic;
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 14px;
              color: #666;
            }
            .footer p {
              margin: 5px 0;
            }

            /* --- RESPONSIVE FIXES --- */
            @media (max-width: 600px) {
              .email-container {
                padding: 10px;
              }
              .header,
              .content {
                padding: 20px;
              }
              .header-title {
                font-size: 22px;
              }
              .main-title {
                font-size: 18px;
              }
              .payment-details {
                padding: 15px;
              }
              .detail-row {
                flex-direction: column;
                align-items: flex-start;
              }
              .detail-value {
                margin-top: 4px;
              }
              .amount {
                font-size: 20px;
              }
              p,
              li {
                font-size: 14px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="header-title">💰 New Coaching Payment Received!</div>
              <div class="header-subtitle">
                A new client has enrolled in your coaching program
              </div>
            </div>

            <div class="content">
              <h2 class="main-title">Great News, ${tutor_name}! 🎉</h2>

              <p style="font-size: 16px; margin-bottom: 20px; text-align: center">
                You have received a new payment for your 1-on-1 True Love Coaching
                Program!
              </p>

              <div class="payment-details">
                <h3 class="payment-title">Payment Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Customer:</span>
                  <span class="detail-value">${customer_name}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${customer_email}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Program:</span>
                  <span class="detail-value">1-on-1 True Love Coaching</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Amount Paid:</span>
                  <span class="detail-value amount">${amount_paid}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">${payment_date}</span>
                </div>
              </div>

              <div class="next-steps">
                <h4 class="steps-title">Next Steps:</h4>
                <ol class="steps-list">
                  <li>
                    <strong>Client Outreach:</strong> Reach out to ${customer_name}
                    within 24 hours to schedule their first session
                  </li>
                  <li>
                    <strong>Session Preparation:</strong> Review their intake form and
                    prepare personalized coaching materials
                  </li>
                  <li>
                    <strong>Calendar Setup:</strong> Send them your booking link for
                    their first consultation
                  </li>
                  <li>
                    <strong>Welcome Package:</strong> Provide them with your welcome
                    materials and program overview
                  </li>
                </ol>
              </div>

              <div class="quote-section">
                <h4 class="quote-title">💫 Coaching Success</h4>
                <p class="quote-text">
                  "Every great love story begins with someone believing it's possible.
                  Thank you for helping create these stories."
                </p>
              </div>

              <p style="font-size: 16px; text-align: center; margin-bottom: 10px">
                Congratulations on this new coaching opportunity! 🎊
              </p>

              <p
                style="
                  font-size: 14px;
                  color: #666;
                  text-align: center;
                  margin-bottom: 0;
                "
              >
                If you have any questions about this payment or need support, please
                don't hesitate to contact us.
              </p>
            </div>

            <div class="footer">
              <p>True Love Coaching Program</p>
              <p style="opacity: 0.8">Connecting Hearts, Creating Forever Love</p>
            </div>
          </div>
        </body>
      </html>
  `;
  },

  // email template self confirmation for self-guided version
  selfGuidedtutorTemplate: (
    tutor_name,
    customer_name,
    customer_email,
    amount_paid,
    payment_date
  ) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>New Self-Guided Program Payment</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f9f9f9;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #1a1a1a;
              color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              text-align: center;
            }
            .header-title {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #ff6b35;
            }
            .header-subtitle {
              font-size: 16px;
              opacity: 0.9;
            }
            .content {
              background-color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              margin-top: 20px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .main-title {
              color: #1a1a1a;
              font-size: 22px;
              margin-bottom: 20px;
              text-align: center;
            }
            .payment-details {
              background-color: #fff3f0;
              padding: 25px;
              border-radius: 8px;
              border: 2px solid #ff6b35;
              margin-bottom: 25px;
            }
            .payment-title {
              color: #ff6b35;
              font-size: 20px;
              margin-bottom: 15px;
              margin-top: 0;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
              flex-wrap: wrap; /* allows stacking on small screens */
            }
            .detail-label {
              font-weight: bold;
              color: #333;
            }
            .detail-value {
              color: #666;
            }
            .amount {
              font-size: 24px;
              font-weight: bold;
              color: #ff6b35;
            }
            .program-info {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 6px;
              margin-bottom: 25px;
            }
            .program-title {
              color: #ff6b35;
              margin-top: 0;
              margin-bottom: 15px;
            }
            .program-list {
              padding-left: 20px;
              margin-bottom: 0;
            }
            .program-list li {
              margin-bottom: 8px;
            }
            .stats-section {
              background-color: #e8f5e8;
              padding: 20px;
              border-radius: 6px;
              text-align: center;
              margin-bottom: 20px;
            }
            .stats-title {
              color: #2d5a2d;
              margin-top: 0;
              margin-bottom: 10px;
            }
            .stats-text {
              margin: 0;
              font-size: 16px;
              color: #2d5a2d;
              font-style: italic;
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 14px;
              color: #666;
            }
            .footer p {
              margin: 5px 0;
            }

            /* --- RESPONSIVE FIXES --- */
            @media (max-width: 600px) {
              .email-container {
                padding: 10px;
              }
              .header,
              .content {
                padding: 20px;
              }
              .header-title {
                font-size: 22px;
              }
              .main-title {
                font-size: 18px;
              }
              .payment-details {
                padding: 15px;
              }
              .detail-row {
                flex-direction: column;
                align-items: flex-start;
              }
              .detail-value {
                margin-top: 4px;
              }
              .amount {
                font-size: 20px;
              }
              p,
              li {
                font-size: 14px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="header-title">📚 New Self-Guided Program Sale!</div>
              <div class="header-subtitle">
                Another success with your self-guided program
              </div>
            </div>

            <div class="content">
              <h2 class="main-title">Fantastic News, ${tutor_name}! 🎉</h2>

              <p style="font-size: 16px; margin-bottom: 20px; text-align: center">
                Your Self-Guided True Love Program has generated another sale!
              </p>

              <div class="payment-details">
                <h3 class="payment-title">Payment Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Customer:</span>
                  <span class="detail-value">${customer_name}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${customer_email}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Program:</span>
                  <span class="detail-value">Self-Guided True Love Program</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Amount Paid:</span>
                  <span class="detail-value amount">${amount_paid}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">${payment_date}</span>
                </div>
              </div>

              <div class="stats-section">
                <h4 class="stats-title">📈 Program Impact</h4>
                <p class="stats-text">
                  "Your self-guided program continues to transform lives. Every
                  purchase is someone taking their first step toward true love."
                </p>
              </div>

              <p style="font-size: 16px; text-align: center; margin-bottom: 10px">
                Keep up the amazing work! Your program is changing lives! ❤️
              </p>

              <p
                style="
                  font-size: 14px;
                  color: #666;
                  text-align: center;
                  margin-bottom: 0;
                "
              >
                The customer has been automatically granted access to all program
                materials and will receive their welcome email shortly.
              </p>
            </div>

            <div class="footer">
              <p>True Love Coaching Program</p>
              <p style="opacity: 0.8">Empowering Love Through Self-Discovery</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  // default template for customer confirmation
  customerTemplate: (customer_name) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Welcome to Your Love Transformation</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f9f9f9;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #1a1a1a;
              color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              text-align: center;
            }
            .header-title {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #ff6b35;
            }
            .header-subtitle {
              font-size: 16px;
              opacity: 0.9;
            }
            .content {
              background-color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              margin-top: 20px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .main-title {
              color: #1a1a1a;
              font-size: 22px;
              margin-bottom: 20px;
              text-align: center;
            }
            .coach-section {
              background-color: #fff3f0;
              padding: 25px;
              border-radius: 8px;
              border: 2px solid #ff6b35;
              margin-bottom: 25px;
              text-align: center;
            }
            .coach-title {
              color: #ff6b35;
              font-size: 20px;
              margin-bottom: 15px;
              margin-top: 0;
            }
            .cta-section {
              background-color: #ff6b35;
              color: white;
              padding: 15px;
              border-radius: 6px;
              margin-bottom: 20px;
            }
            .cta-title {
              margin: 0 0 10px 0;
              font-size: 18px;
            }
            .cta-text {
              margin: 0 0 15px 0;
              font-size: 14px;
            }
            .cta-button {
              display: inline-block;
              background-color: white;
              color: #ff6b35;
              padding: 12px 25px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              font-size: 16px;
            }
            .next-steps {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 6px;
              margin-bottom: 25px;
            }
            .steps-title {
              color: #ff6b35;
              margin-top: 0;
              margin-bottom: 15px;
            }
            .steps-list {
              padding-left: 20px;
              margin-bottom: 0;
            }
            .steps-list li {
              margin-bottom: 10px;
            }
            .quote-section {
              background-color: #e8f5e8;
              padding: 20px;
              border-radius: 6px;
              text-align: center;
              margin-bottom: 20px;
            }
            .quote-title {
              color: #2d5a2d;
              margin-top: 0;
              margin-bottom: 10px;
            }
            .quote-text {
              margin: 0;
              font-size: 16px;
              color: #2d5a2d;
              font-style: italic;
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 14px;
              color: #666;
            }
            .footer p {
              margin: 5px 0;
            }

            /* ✅ Responsive styles */
            @media only screen and (max-width: 600px) {
              .email-container {
                padding: 15px;
                width: 100% !important;
              }
              .header {
                padding: 20px;
              }
              .header-title {
                font-size: 22px;
              }
              .header-subtitle {
                font-size: 14px;
              }
              .content {
                padding: 20px;
              }
              .main-title {
                font-size: 20px;
              }
              .coach-title {
                font-size: 18px;
              }
              .cta-title {
                font-size: 16px;
              }
              .cta-button {
                font-size: 14px;
                padding: 10px 20px;
                display: block;
                width: 100%;
                text-align: center;
              }
              .quote-text {
                font-size: 14px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="header-title">❤️ Welcome to Your Love Transformation!</div>
              <div class="header-subtitle">
                Your True Love Coaching Journey Begins Now
              </div>
            </div>

            <div class="content">
              <h2 class="main-title">Congratulations, ${customer_name}! 🎉</h2>

              <p style="font-size: 16px; margin-bottom: 20px; text-align: center">
                Your payment has been successfully processed, and you're now enrolled
                in our exclusive 1-on-1 True Love Coaching Program!
              </p>

              <div class="coach-section">
                <h3 class="coach-title">Meet Your Love Coach: David James Prorok</h3>
                <p style="font-size: 16px; margin-bottom: 20px">
                  David is a certified relationship expert who has helped hundreds of
                  people find their true love. He's excited to work with you
                  personally on your unique journey to lasting love.
                </p>

                <div class="cta-section">
                  <h4 class="cta-title">🗓️ Book Your First Session Now!</h4>
                  <p class="cta-text">
                    Click the button below to schedule your initial consultation
                  </p>
                  <a href="https://calendly.com/davidprorok/45min" class="cta-button"
                    >Schedule Your Session ➤</a
                  >
                </div>
              </div>

              <div class="next-steps">
                <h4 class="steps-title">What Happens Next:</h4>
                <ol class="steps-list">
                  <li>
                    <strong>Book Your Session:</strong> Use the Calendly link above to
                    choose a time that works for you
                  </li>
                  <li>
                    <strong>Prepare for Success:</strong> David will send you a
                    pre-session questionnaire to maximize your time together
                  </li>
                  <li>
                    <strong>Begin Your Transformation:</strong> Your first session
                    will focus on understanding your unique love story and creating
                    your personalized roadmap
                  </li>
                  <li>
                    <strong>Experience True Love:</strong> Follow David's proven
                    system to attract and maintain the love you deserve
                  </li>
                </ol>
              </div>

              <div class="quote-section">
                <h4 class="quote-title">💫 Your Love Story Starts Today</h4>
                <p class="quote-text">
                  "True love is not about finding someone you can live with, but
                  finding someone you can't live without. Your journey to that person
                  begins now."
                </p>
              </div>

              <p style="font-size: 16px; text-align: center; margin-bottom: 10px">
                We're thrilled to be part of your love story! ❤️
              </p>

              <p
                style="
                  font-size: 14px;
                  color: #666;
                  text-align: center;
                  margin-bottom: 0;
                "
              >
                If you have any questions, please don't hesitate to reach out. We're
                here to support you every step of the way.
              </p>
            </div>

            <div class="footer">
              <p>True Love Coaching Program</p>
              <p style="opacity: 0.8">Your Personalized Path to Lasting Love</p>
            </div>
          </div>
        </body>
      </html>
  `;
  },

  // email paymemt template for customer self guided version
  selfGuidedCustomerTemplate: (customer_name) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Welcome to Self-Guided True Love Program</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f9f9f9;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #1a1a1a;
              color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              text-align: center;
            }
            .header-title {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #ff6b35;
            }
            .header-subtitle {
              font-size: 16px;
              opacity: 0.9;
            }
            .content {
              background-color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              margin-top: 20px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .main-title {
              color: #1a1a1a;
              font-size: 22px;
              margin-bottom: 20px;
              text-align: center;
            }
            .access-section {
              background-color: #fff3f0;
              padding: 25px;
              border-radius: 8px;
              border: 2px solid #ff6b35;
              margin-bottom: 25px;
              text-align: center;
            }
            .access-title {
              color: #ff6b35;
              font-size: 20px;
              margin-bottom: 15px;
              margin-top: 0;
            }
            .cta-button {
              display: inline-block;
              background-color: #ff6b35;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              font-size: 18px;
              margin-top: 15px;
            }
            .roadmap-section {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 6px;
              margin-bottom: 25px;
            }
            .roadmap-title {
              color: #ff6b35;
              margin-top: 0;
              margin-bottom: 15px;
            }
            .week-list {
              padding-left: 20px;
              margin-bottom: 0;
            }
            .week-list li {
              margin-bottom: 12px;
            }
            .week-title {
              font-weight: bold;
              color: #333;
            }
            .week-desc {
              color: #666;
              margin-left: 10px;
            }
            .benefits-section {
              background-color: #e8f5e8;
              padding: 20px;
              border-radius: 6px;
              margin-bottom: 25px;
            }
            .benefits-title {
              color: #2d5a2d;
              margin-top: 0;
              margin-bottom: 15px;
            }
            .benefits-list {
              padding-left: 20px;
              margin-bottom: 0;
            }
            .benefits-list li {
              margin-bottom: 8px;
              color: #2d5a2d;
            }
            .quote-section {
              background-color: #fff3e0;
              padding: 20px;
              border-radius: 6px;
              text-align: center;
              margin-bottom: 20px;
            }
            .quote-title {
              color: #ff6b35;
              margin-top: 0;
              margin-bottom: 10px;
            }
            .quote-text {
              margin: 0;
              font-size: 16px;
              color: #ff6b35;
              font-style: italic;
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 14px;
              color: #666;
            }
            .footer p {
              margin: 5px 0;
            }

            /* ✅ Responsive styles */
            @media only screen and (max-width: 600px) {
              .email-container {
                padding: 15px;
              }
              .header {
                padding: 20px;
              }
              .header-title {
                font-size: 22px;
              }
              .header-subtitle {
                font-size: 14px;
              }
              .content {
                padding: 20px;
              }
              .main-title {
                font-size: 20px;
              }
              .access-section {
                padding: 20px;
              }
              .access-title {
                font-size: 18px;
              }
              .cta-button {
                display: block;
                width: 100%;
                font-size: 16px;
                padding: 14px;
              }
              .roadmap-section,
              .benefits-section,
              .quote-section {
                padding: 15px;
              }
              .week-list {
                padding-left: 15px;
              }
              .benefits-list {
                padding-left: 15px;
              }
              .quote-text {
                font-size: 14px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="header-title">🎯 Welcome to Your Self-Guided Journey!</div>
              <div class="header-subtitle">
                Your True Love Program Access is Ready
              </div>
            </div>

            <div class="content">
              <h2 class="main-title">Thank You, ${customer_name}! 🎉</h2>

              <p style="font-size: 16px; margin-bottom: 20px; text-align: center">
                Your payment has been confirmed and you now have full access to our
                comprehensive Self-Guided True Love Program!
              </p>

              <div class="access-section">
                <h3 class="access-title">🚀 Start Your Transformation Today</h3>
                <p style="font-size: 16px; margin-bottom: 15px">
                  Your personalized love journey awaits. Click below to access your
                  program dashboard and begin Week 1.
                </p>
                <a href="https://true-love.app/self-guided" class="cta-button"
                  >Access Your Program ➤</a
                >
              </div>

              <div class="roadmap-section">
                <h4 class="roadmap-title">📅 Your 6-Week Love Roadmap:</h4>
                <ol class="week-list">
                  <li>
                    <span class="week-title">Week 1: Foundation of Self-Love</span>
                    <div class="week-desc">
                      Build unshakeable confidence and discover your authentic self
                    </div>
                  </li>
                  <li>
                    <span class="week-title"
                      >Week 2: Understanding Your Love Language</span
                    >
                    <div class="week-desc">
                      Learn how you give and receive love most naturally
                    </div>
                  </li>
                  <li>
                    <span class="week-title"
                      >Week 3: Building Confidence & Attraction</span
                    >
                    <div class="week-desc">
                      Develop magnetic presence and authentic charisma
                    </div>
                  </li>
                  <li>
                    <span class="week-title"
                      >Week 4: Effective Communication Skills</span
                    >
                    <div class="week-desc">
                      Master the art of meaningful connection and conversation
                    </div>
                  </li>
                  <li>
                    <span class="week-title"
                      >Week 5: Creating Lasting Connections</span
                    >
                    <div class="week-desc">
                      Learn to identify and nurture potential life partners
                    </div>
                  </li>
                  <li>
                    <span class="week-title">Week 6: Maintaining Long-term Love</span>
                    <div class="week-desc">
                      Build the skills to keep love alive and growing forever
                    </div>
                  </li>
                </ol>
              </div>

              <div class="benefits-section">
                <h4 class="benefits-title">✨ What You Get:</h4>
                <ul class="benefits-list">
                  <li>6 comprehensive weekly modules with video content</li>
                  <li>Downloadable workbooks and exercises</li>
                  <li>Self-assessment tools and progress tracking</li>
                  <li>Lifetime access to all materials</li>
                  <li>Bonus resources and templates</li>
                </ul>
              </div>

              <div class="quote-section">
                <h4 class="quote-title">💫 Your Love Story Awaits</h4>
                <p class="quote-text">
                  "The greatest love stories are not found, they are created. Your
                  creation begins today."
                </p>
              </div>

              <p style="font-size: 16px; text-align: center; margin-bottom: 10px">
                Ready to transform your love life? Let's begin! ❤️
              </p>

              <p
                style="
                  font-size: 14px;
                  color: #666;
                  text-align: center;
                  margin-bottom: 0;
                "
              >
                If you have any questions or need technical support, we're here to
                help every step of the way.
              </p>
            </div>

            <div class="footer">
              <p>True Love Coaching Program</p>
              <p style="opacity: 0.8">Your Self-Guided Path to Lasting Love</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  // email verification template
  emailVerificationTemplate: (user_name, verification_code) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Verify Your Email Address</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f9f9f9;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #1a1a1a;
              color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              text-align: center;
            }
            .header-title {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #ff6b35;
            }
            .header-subtitle {
              font-size: 16px;
              opacity: 0.9;
            }
            .content {
              background-color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              margin-top: 20px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .main-title {
              color: #1a1a1a;
              font-size: 22px;
              margin-bottom: 20px;
              text-align: center;
            }
            .code-section {
              background-color: #fff3f0;
              padding: 25px;
              border-radius: 8px;
              border: 2px solid #ff6b35;
              margin-bottom: 25px;
              text-align: center;
            }
            .code-title {
              color: #ff6b35;
              font-size: 20px;
              margin-bottom: 15px;
              margin-top: 0;
            }
            .verification-code {
              font-size: 36px;
              font-weight: bold;
              color: #ff6b35;
              font-family: monospace;
              letter-spacing: 8px;
              margin: 20px 0;
              padding: 15px;
              background-color: white;
              border-radius: 6px;
              border: 2px dashed #ff6b35;
              word-break: break-word;
            }
            .instructions-section {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 6px;
              margin-bottom: 25px;
            }
            .instructions-title {
              color: #ff6b35;
              margin-top: 0;
              margin-bottom: 15px;
            }
            .instructions-list {
              padding-left: 20px;
              margin-bottom: 0;
            }
            .instructions-list li {
              margin-bottom: 10px;
            }
            .warning-section {
              background-color: #fff9e6;
              padding: 20px;
              border-radius: 6px;
              border-left: 4px solid #ffc107;
              margin-bottom: 25px;
            }
            .warning-title {
              color: #856404;
              margin-top: 0;
              margin-bottom: 10px;
            }
            .warning-list {
              color: #856404;
              padding-left: 20px;
              margin-bottom: 0;
            }
            .warning-list li {
              margin-bottom: 8px;
            }
            .verify-button {
              display: block;
              width: 200px;
              margin: 20px auto;
              background-color: #ff6b35;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              font-size: 18px;
              text-align: center;
            }
            .quote-section {
              background-color: #e8f5e8;
              padding: 20px;
              border-radius: 6px;
              text-align: center;
              margin-bottom: 20px;
            }
            .quote-title {
              color: #2d5a2d;
              margin-top: 0;
              margin-bottom: 10px;
            }
            .quote-text {
              margin: 0;
              font-size: 16px;
              color: #2d5a2d;
              font-style: italic;
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 14px;
              color: #666;
            }
            .footer p {
              margin: 5px 0;
            }

            /* ✅ Responsive styles */
            @media only screen and (max-width: 600px) {
              .email-container {
                padding: 10px;
              }
              .header {
                padding: 20px;
              }
              .header-title {
                font-size: 22px;
              }
              .header-subtitle {
                font-size: 14px;
              }
              .content {
                padding: 20px;
              }
              .main-title {
                font-size: 20px;
              }
              .code-section {
                padding: 15px;
              }
              .verification-code {
                font-size: 24px;
                letter-spacing: 4px;
                padding: 10px;
              }
              .instructions-section,
              .warning-section,
              .quote-section {
                padding: 15px;
              }
              .verify-button {
                width: 100%;
                max-width: 280px;
                font-size: 16px;
                padding: 12px 20px;
              }
              .quote-text {
                font-size: 14px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="header-title">📧 Verify Your Email</div>
              <div class="header-subtitle">
                One Quick Step to Complete Your Registration
              </div>
            </div>

            <div class="content">
              <h2 class="main-title">Hello ${user_name}! 👋</h2>

              <p style="font-size: 16px; margin-bottom: 25px; text-align: center">
                Welcome to True Love! To complete your registration and secure your
                account, please verify your email address using the code below.
              </p>

              <div class="code-section">
                <h3 class="code-title">🔐 Your Verification Code</h3>
                <div class="verification-code">${verification_code}</div>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px">
                  Enter this code on the verification page to continue
                </p>
              </div>

              <div class="instructions-section">
                <h4 class="instructions-title">📋 How to Verify:</h4>
                <ol class="instructions-list">
                  <li>Copy the verification code above</li>
                  <li>Return to the True Love app verification page</li>
                  <li>Paste or type the code in the verification field</li>
                  <li>Click "Verify Email" to complete the process</li>
                </ol>
              </div>

              <div class="warning-section">
                <h4 class="warning-title">⚠️ Important Notes:</h4>
                <ul class="warning-list">
                  <li>
                    This code will expire in <strong>15 minutes</strong> for your
                    security
                  </li>
                  <li>
                    If you didn't request this verification, you can safely ignore
                    this email
                  </li>
                  <li>Keep this code private and don't share it with anyone</li>
                  <li>If the code expires, you can request a new one from the app</li>
                </ul>
              </div>

              <div class="quote-section">
                <h4 class="quote-title">💫 Almost There!</h4>
                <p class="quote-text">
                  "Your love story is just one verification away. Let's make it
                  official and begin your transformation!"
                </p>
              </div>

              <p style="font-size: 16px; text-align: center; margin-bottom: 10px">
                Can't wait to welcome you to the True Love family! ❤️
              </p>

              <p
                style="
                  font-size: 14px;
                  color: #666;
                  text-align: center;
                  margin-bottom: 0;
                "
              >
                Having trouble? Contact our support team and we'll help you get
                verified quickly.
              </p>
            </div>

            <div class="footer">
              <p>True Love Coaching Program</p>
              <p style="opacity: 0.8">Verification Complete = Journey Begins</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  // reset password email
  passwordVerificationTemplate: (reset_code) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Password Reset Verification</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f9f9f9;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #1a1a1a;
              color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              text-align: center;
            }
            .header-title {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #ff6b35;
            }
            .header-subtitle {
              font-size: 16px;
              opacity: 0.9;
            }
            .content {
              background-color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              margin-top: 20px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .main-title {
              color: #1a1a1a;
              font-size: 22px;
              margin-bottom: 20px;
              text-align: center;
            }
            .code-section {
              background-color: #fff3f0;
              padding: 25px;
              border-radius: 8px;
              border: 2px solid #ff6b35;
              margin-bottom: 25px;
              text-align: center;
            }
            .code-title {
              color: #ff6b35;
              font-size: 20px;
              margin-bottom: 15px;
              margin-top: 0;
            }
            .reset-code {
              font-size: 36px;
              font-weight: bold;
              color: #ff6b35;
              font-family: monospace;
              letter-spacing: 6px;
              margin: 20px 0;
              padding: 15px;
              background-color: white;
              border-radius: 6px;
              border: 2px dashed #ff6b35;
              word-break: break-word;
            }
            .instructions-section {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 6px;
              margin-bottom: 25px;
            }
            .instructions-title {
              color: #ff6b35;
              margin-top: 0;
              margin-bottom: 15px;
            }
            .instructions-list {
              padding-left: 20px;
              margin-bottom: 0;
            }
            .instructions-list li {
              margin-bottom: 10px;
            }
            .security-section {
              background-color: #fff9e6;
              padding: 20px;
              border-radius: 6px;
              border-left: 4px solid #ffc107;
              margin-bottom: 25px;
            }
            .security-title {
              color: #856404;
              margin-top: 0;
              margin-bottom: 10px;
            }
            .security-list {
              color: #856404;
              padding-left: 20px;
              margin-bottom: 0;
            }
            .security-list li {
              margin-bottom: 8px;
            }
            .reset-button {
              display: block;
              width: 220px;
              margin: 20px auto;
              background-color: #ff6b35;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              font-size: 18px;
              text-align: center;
            }
            .ignore-section {
              background-color: #e3f2fd;
              padding: 20px;
              border-radius: 6px;
              border-left: 4px solid #2196f3;
              margin-bottom: 20px;
            }
            .ignore-title {
              color: #1565c0;
              margin-top: 0;
              margin-bottom: 10px;
            }
            .ignore-text {
              color: #1565c0;
              margin: 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 14px;
              color: #666;
            }
            .footer p {
              margin: 5px 0;
            }

            /* ✅ Responsive adjustments */
            @media only screen and (max-width: 600px) {
              .email-container {
                padding: 10px;
              }
              .header {
                padding: 20px;
              }
              .header-title {
                font-size: 22px;
              }
              .header-subtitle {
                font-size: 14px;
              }
              .content {
                padding: 20px;
              }
              .main-title {
                font-size: 20px;
              }
              .code-section {
                padding: 15px;
              }
              .reset-code {
                font-size: 24px;
                letter-spacing: 3px;
                padding: 10px;
              }
              .instructions-section,
              .security-section,
              .ignore-section {
                padding: 15px;
              }
              .reset-button {
                width: 100%;
                max-width: 280px;
                font-size: 16px;
                padding: 12px 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="header-title">🔒 Password Reset Request</div>
              <div class="header-subtitle">
                Secure Your Account with a New Password
              </div>
            </div>

            <div class="content">
              <h2 class="main-title">Hello Dear! 🔐</h2>

              <p style="font-size: 16px; margin-bottom: 25px; text-align: center">
                We received a request to reset your password for your True Love
                account. Use the verification code below to create a new password.
              </p>

              <div class="code-section">
                <h3 class="code-title">🔑 Your Reset Code</h3>
                <div class="reset-code">${reset_code}</div>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px">
                  Enter this code on the password reset page
                </p>
              </div>

              <div class="security-section">
                <h4 class="security-title">🛡️ Security Information:</h4>
                <ul class="security-list">
                  <li>This reset code will expire in <strong>15 minutes</strong></li>
                  <li>The code can only be used once</li>
                  <li>Choose a strong password with at least 8 characters</li>
                  <li>Include uppercase, lowercase, numbers, and symbols</li>
                  <li>Don't reuse old passwords</li>
                </ul>
              </div>

              <div class="ignore-section">
                <h4 class="ignore-title">ℹ️ Didn't Request This?</h4>
                <p class="ignore-text">
                  If you didn't request a password reset, you can safely ignore this
                  email. Your account remains secure and no changes have been made.
                </p>
              </div>

              <p style="font-size: 16px; text-align: center; margin-bottom: 10px">
                Your account security is our top priority! 🔒
              </p>

              <p
                style="
                  font-size: 14px;
                  color: #666;
                  text-align: center;
                  margin-bottom: 0;
                "
              >
                Need help? Our support team is here to assist you with any password
                reset issues.
              </p>
            </div>

            <div class="footer">
              <p>True Love Coaching Program</p>
              <p style="opacity: 0.8">Keeping Your Love Journey Secure</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  // password reset sucessful
  paswordResetSucessful: (user_name) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Password Reset Successful</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f9f9f9;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #1a1a1a;
              color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              text-align: center;
            }
            .header-title {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #28a745;
            }
            .header-subtitle {
              font-size: 16px;
              opacity: 0.9;
            }
            .content {
              background-color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              margin-top: 20px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .main-title {
              color: #1a1a1a;
              font-size: 22px;
              margin-bottom: 20px;
              text-align: center;
            }
            .success-section {
              background-color: #d4edda;
              padding: 25px;
              border-radius: 8px;
              border: 2px solid #28a745;
              margin-bottom: 25px;
              text-align: center;
            }
            .success-title {
              color: #155724;
              font-size: 20px;
              margin-bottom: 15px;
              margin-top: 0;
            }
            .success-icon {
              font-size: 48px;
              color: #28a745;
              margin-bottom: 15px;
            }
            .login-section {
              background-color: #fff3f0;
              padding: 25px;
              border-radius: 8px;
              border: 2px solid #ff6b35;
              margin-bottom: 25px;
              text-align: center;
            }
            .login-title {
              color: #ff6b35;
              font-size: 20px;
              margin-bottom: 15px;
              margin-top: 0;
            }
            .login-button {
              display: inline-block;
              background-color: #ff6b35;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              font-size: 18px;
              margin-top: 15px;
            }
            .security-section {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 6px;
              margin-bottom: 25px;
            }
            .security-title {
              color: #ff6b35;
              margin-top: 0;
              margin-bottom: 15px;
            }
            .security-list {
              padding-left: 20px;
              margin-bottom: 0;
            }
            .security-list li {
              margin-bottom: 10px;
            }
            .next-steps {
              background-color: #e8f5e8;
              padding: 20px;
              border-radius: 6px;
              margin-bottom: 25px;
            }
            .steps-title {
              color: #2d5a2d;
              margin-top: 0;
              margin-bottom: 15px;
            }
            .steps-list {
              padding-left: 20px;
              margin-bottom: 0;
            }
            .steps-list li {
              margin-bottom: 10px;
              color: #2d5a2d;
            }
            .quote-section {
              background-color: #fff3e0;
              padding: 20px;
              border-radius: 6px;
              text-align: center;
              margin-bottom: 20px;
            }
            .quote-title {
              color: #ff6b35;
              margin-top: 0;
              margin-bottom: 10px;
            }
            .quote-text {
              margin: 0;
              font-size: 16px;
              color: #ff6b35;
              font-style: italic;
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 14px;
              color: #666;
            }
            .footer p {
              margin: 5px 0;
            }

            /* ✅ Responsive styles */
            @media screen and (max-width: 600px) {
              .email-container {
                padding: 10px;
              }
              .header,
              .content {
                padding: 20px;
              }
              .header-title {
                font-size: 22px;
              }
              .header-subtitle {
                font-size: 14px;
              }
              .main-title {
                font-size: 18px;
              }
              .success-title,
              .login-title,
              .security-title,
              .steps-title,
              .quote-title {
                font-size: 16px;
              }
              .login-button {
                display: block;
                width: 100%;
                padding: 12px;
                font-size: 16px;
              }
              .success-icon {
                font-size: 40px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="header-title">✅ Password Updated Successfully!</div>
              <div class="header-subtitle">Your Account is Now More Secure</div>
            </div>

            <div class="content">
              <h2 class="main-title">Great News, ${user_name}! 🎉</h2>

              <div class="success-section">
                <div class="success-icon">🔐</div>
                <h3 class="success-title">Password Reset Complete!</h3>
                <p style="margin: 0; color: #155724; font-size: 16px">
                  Your password has been successfully updated. Your True Love account is now secured with your new password.
                </p>
              </div>

              <p style="font-size: 16px; margin-bottom: 25px; text-align: center">
                You can now log in with your new password and continue your love transformation journey!
              </p>

              <div class="login-section">
                <h3 class="login-title">🚀 Ready to Continue?</h3>
                <p style="margin-bottom: 15px; color: #666">
                  Log in now with your new password and pick up where you left off
                </p>
                <a href="https://true-love.app/auth" class="login-button">Login to Your Account ➤</a>
              </div>

              <div class="security-section">
                <h4 class="security-title">🛡️ Security Tips for Your Account:</h4>
                <ul class="security-list">
                  <li>Keep your password private and don't share it with anyone</li>
                  <li>Use a unique password that you don't use for other accounts</li>
                  <li>Consider using a password manager for added security</li>
                  <li>Log out of shared or public devices</li>
                  <li>Contact us immediately if you notice any suspicious activity</li>
                </ul>
              </div>

              <div class="footer">
                <p>True Love Coaching Program</p>
                <p style="opacity: 0.8">Your Secure Path to Lasting Love</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  // default password email template
  defaultPasswordTemplate: (user_name, user_email, default_password) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome - Your Account Details</title>
          <style>
              body {
                  margin: 0;
                  padding: 0;
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  background-color: #f9f9f9;
              }
              .email-container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
              }
              .header {
                  background-color: #1a1a1a;
                  color: #ffffff;
                  padding: 30px;
                  border-radius: 8px;
                  text-align: center;
              }
              .header-title {
                  font-size: 28px;
                  font-weight: bold;
                  margin-bottom: 10px;
                  color: #FF6B35;
              }
              .header-subtitle {
                  font-size: 16px;
                  opacity: 0.9;
              }
              .content {
                  background-color: #ffffff;
                  padding: 30px;
                  border-radius: 8px;
                  margin-top: 20px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .main-title {
                  color: #1a1a1a;
                  font-size: 22px;
                  margin-bottom: 20px;
                  text-align: center;
              }
              .credentials-section {
                  background-color: #fff3f0;
                  padding: 25px;
                  border-radius: 8px;
                  border: 2px solid #FF6B35;
                  margin-bottom: 25px;
              }
              .credentials-title {
                  color: #FF6B35;
                  font-size: 20px;
                  margin-bottom: 20px;
                  margin-top: 0;
                  text-align: center;
              }
              .credential-row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 15px;
                  padding: 10px;
                  background-color: #f8f9fa;
                  border-radius: 4px;
              }
              .credential-label {
                  font-weight: bold;
                  color: #333;
              }
              .credential-value {
                  color: #666;
                  font-family: monospace;
                  background-color: white;
                  padding: 4px 8px;
                  border-radius: 3px;
                  border: 1px solid #ddd;
              }
              .login-button {
                  display: block;
                  width: 200px;
                  margin: 20px auto;
                  background-color: #FF6B35;
                  color: white;
                  padding: 15px 30px;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: bold;
                  font-size: 18px;
                  text-align: center;
              }
              .security-section {
                  background-color: #fff9e6;
                  padding: 20px;
                  border-radius: 6px;
                  border-left: 4px solid #ffc107;
                  margin-bottom: 25px;
              }
              .security-title {
                  color: #856404;
                  margin-top: 0;
                  margin-bottom: 15px;
              }
              .security-text {
                  color: #856404;
                  margin-bottom: 10px;
              }
              .next-steps {
                  background-color: #f8f9fa;
                  padding: 20px;
                  border-radius: 6px;
                  margin-bottom: 25px;
              }
              .steps-title {
                  color: #FF6B35;
                  margin-top: 0;
                  margin-bottom: 15px;
              }
              .steps-list {
                  padding-left: 20px;
                  margin-bottom: 0;
              }
              .steps-list li {
                  margin-bottom: 10px;
              }
              .quote-section {
                  background-color: #e8f5e8;
                  padding: 20px;
                  border-radius: 6px;
                  text-align: center;
                  margin-bottom: 20px;
              }
              .quote-title {
                  color: #2d5a2d;
                  margin-top: 0;
                  margin-bottom: 10px;
              }
              .quote-text {
                  margin: 0;
                  font-size: 16px;
                  color: #2d5a2d;
                  font-style: italic;
              }
              .footer {
                  text-align: center;
                  padding: 20px;
                  font-size: 14px;
                  color: #666;
              }
              .footer p {
                  margin: 5px 0;
              }

              /* ✅ Responsive styles */
              @media screen and (max-width: 600px) {
                  .email-container {
                      padding: 10px;
                  }
                  .header, .content {
                      padding: 20px;
                  }
                  .header-title {
                      font-size: 22px;
                  }
                  .header-subtitle {
                      font-size: 14px;
                  }
                  .main-title {
                      font-size: 18px;
                  }
                  .credentials-title,
                  .steps-title,
                  .quote-title,
                  .security-title {
                      font-size: 16px;
                  }
                  .credential-row {
                      display: block;
                      text-align: center;
                  }
                  .credential-label {
                      display: block;
                      margin-bottom: 5px;
                  }
                  .credential-value {
                      display: inline-block;
                      margin-top: 5px;
                  }
                  .login-button {
                      width: 100%;
                      padding: 12px;
                      font-size: 16px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="header">
                  <div class="header-title">🔐 Welcome to True Love!</div>
                  <div class="header-subtitle">Your Account is Ready - Let's Begin Your Journey</div>
              </div>

              <div class="content">
                  <h2 class="main-title">Hello ${user_name}! 🎉</h2>

                  <p style="font-size: 16px; margin-bottom: 25px; text-align: center;">
                      Your account has been created successfully! Below are your login credentials to access your True Love program.
                  </p>

                  <div class="credentials-section">
                      <h3 class="credentials-title">🔑 Your Login Information</h3>
                      <div class="credential-row">
                          <span class="credential-label">Email:</span>
                          <span class="credential-value">${user_email}</span>
                      </div>
                      <div class="credential-row">
                          <span class="credential-label">Temporary Password:</span>
                          <span class="credential-value">${default_password}</span>
                      </div>
                  </div>

                  <a href="https://true-love.app/auth" class="login-button">Login to Your Account ➤</a>

                  <div class="security-section">
                      <h4 class="security-title">🛡️ Important Security Notice</h4>
                      <p class="security-text">
                          <strong>Please change your password immediately after logging in.</strong> This temporary password is only meant for your first login.
                      </p>
                      <p class="security-text">
                          For your security, this password will expire in 24 hours if not used.
                      </p>
                  </div>

                  <div class="next-steps">
                      <h4 class="steps-title">📋 Next Steps:</h4>
                      <ol class="steps-list">
                          <li><strong>Login:</strong> Click the button above to access your account</li>
                          <li><strong>Change Password:</strong> Update your password to something secure and memorable</li>
                          <li><strong>Complete Profile:</strong> Fill out your profile information for a personalized experience</li>
                          <li><strong>Start Your Journey:</strong> Begin with Week 1 of your True Love program</li>
                          <li><strong>Set Reminders:</strong> Schedule time each week to complete your lessons</li>
                      </ol>
                  </div>

                  <div class="quote-section">
                      <h4 class="quote-title">💫 Your Journey Begins</h4>
                      <p class="quote-text">
                          "Every love story starts with a single step. Today, you've taken that step toward your forever love."
                      </p>
                  </div>

                  <p style="font-size: 16px; text-align: center; margin-bottom: 10px;">
                      We're excited to guide you on this transformative journey! ❤️
                  </p>
                  
                  <p style="font-size: 14px; color: #666; text-align: center; margin-bottom: 0;">
                      If you have any trouble logging in or need assistance, please don't hesitate to contact our support team.
                  </p>
              </div>

              <div class="footer">
                  <p>True Love Coaching Program</p>
                  <p style="opacity: 0.8;">Your Journey to Lasting Love Starts Here</p>
              </div>
          </div>
      </body>
      </html>
    `;
  },
};
