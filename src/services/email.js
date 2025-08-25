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
    console.log(`An error occur: ${error}`);
    return false;
  }
};

// email template
export const templates = {
  // default template self confirmation
  userTemplate: (user_name, customer_name, customer_email, amount) => {
    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>New Payment Received</title>
    <style>
      body {
        background-color: #1a1a1a;
        color: #fff;
        font-family: Arial, sans-serif;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: auto;
        background-color: #262626;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid #444;
      }
      .header {
        background-color: #ffcc00;
        padding: 20px;
        text-align: center;
        color: #000;
        font-size: 24px;
        font-weight: bold;
      }
      .content {
        padding: 20px;
        line-height: 1.6;
      }
      .highlight {
        color: #ffcc00;
        font-weight: bold;
      }
      .footer {
        padding: 15px;
        font-size: 12px;
        color: #888;
        text-align: center;
        background-color: #1a1a1a;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        💛 True Love Transformation Program
      </div>
      <div class="content">
        <p>Hello <strong>${user_name}</strong>,</p>
        <p>🎉 You just received a new payment for the <span class="highlight">True Love Transformation Program</span>.</p>
        <p><strong>Customer Name:</strong> ${customer_name}</p>
        <p><strong>Email:</strong> ${customer_email}</p>
        <p><strong>Amount Paid:</strong> ${amount}</p>
        <p>Go make someone's love journey magical ❤️</p>
      </div>
      <div class="footer">
        This is an automated payment notification.
      </div>
    </div>
  </body>
  </html>
  `;
  },

  // email template self confirmation for self-guided version
  selfGuidedUserTemplate: (
    user_name,
    customer_name,
    customer_email,
    amount
  ) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>New Payment Received</title>
        <style>
          body {
            background-color: #1a1a1a;
            color: #fff;
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: auto;
            background-color: #262626;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #444;
          }
          .header {
            background-color: #ffcc00;
            padding: 20px;
            text-align: center;
            color: #000;
            font-size: 24px;
            font-weight: bold;
          }
          .content {
            padding: 20px;
            line-height: 1.6;
          }
          .highlight {
            color: #ffcc00;
            font-weight: bold;
          }
          .footer {
            padding: 15px;
            font-size: 12px;
            color: #888;
            text-align: center;
            background-color: #1a1a1a;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            💛 Self-Guided Coaching Payment
          </div>
          <div class="content">
            <p>Hello <strong>${user_name}</strong>,</p>
            <p>🎉 A new payment has been received for the <span class="highlight">Self-Guided True Love Coaching Program</span>.</p>
            <p><strong>Customer Name:</strong> ${customer_name}</p>
            <p><strong>Email:</strong> ${customer_email}</p>
            <p><strong>Amount Paid:</strong> ${amount}</p>
            <p>This customer now has access to the self-guided journey inside the app. 🌟</p>
          </div>
          <div class="footer">
            This is an automated payment notification.
          </div>
        </div>
      </body>
      </html>
    `;
  },

  // default template for customer confirmation
  customerTemplate: (customer_name, amount) => {
    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Payment Successful</title>
    <style>
      body {
        background-color: #1a1a1a;
        color: #fff;
        font-family: Arial, sans-serif;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: auto;
        background-color: #262626;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid #444;
      }
      .header {
        background-color: #ffcc00;
        padding: 20px;
        text-align: center;
        color: #000;
        font-size: 24px;
        font-weight: bold;
      }
      .content {
        padding: 20px;
        line-height: 1.6;
      }
      .highlight {
        color: #ffcc00;
        font-weight: bold;
      }
      .cta {
        display: inline-block;
        background-color: #ffcc00;
        color: #000;
        padding: 12px 20px;
        margin-top: 20px;
        text-decoration: none;
        font-weight: bold;
        border-radius: 6px;
      }
      .footer {
        padding: 15px;
        font-size: 12px;
        color: #888;
        text-align: center;
        background-color: #1a1a1a;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        💛 Payment Confirmed!
      </div>
      <div class="content">
        <p>Dear <strong>${customer_name}</strong>,</p>
        <p>Thank you for joining the <span class="highlight">True Love Transformation Program</span>! 💫</p>
        <p>Your payment of <strong>${amount}</strong> has been received successfully. We’re excited to start this journey with you.</p>
        <p>Stay tuned — more details are coming to your inbox soon.</p>
      </div>
      <div class="footer">
        This email was sent from a no-reply address. Please do not reply directly.
      </div>
    </div>
  </body>
  </html>
  `;
  },

  // email paymemt template for customer self guided version
  selfGuidedCustomerTemplate: (customer_name, amount) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Payment Successful</title>
        <style>
          body {
            background-color: #1a1a1a;
            color: #fff;
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: auto;
            background-color: #262626;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #444;
          }
          .header {
            background-color: #ffcc00;
            padding: 20px;
            text-align: center;
            color: #000;
            font-size: 24px;
            font-weight: bold;
          }
          .content {
            padding: 20px;
            line-height: 1.6;
          }
          .highlight {
            color: #ffcc00;
            font-weight: bold;
          }
          .cta {
            display: inline-block;
            background-color: #ffcc00;
            color: #000;
            padding: 12px 20px;
            margin-top: 20px;
            text-decoration: none;
            font-weight: bold;
            border-radius: 6px;
          }
          .footer {
            padding: 15px;
            font-size: 12px;
            color: #888;
            text-align: center;
            background-color: #1a1a1a;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            💛 Welcome to Self-Guided Coaching!
          </div>
          <div class="content">
            <p>Dear <strong>${customer_name}</strong>,</p>
            <p>Thank you for purchasing the <span class="highlight">Self-Guided True Love Coaching Program</span>! 🌟</p>
            <p>Your payment of <strong>${amount}</strong> has been received successfully.</p>
            <p>You now have access to the self-guided journey inside our app — designed to help you grow, heal, and build the love life you deserve, at your own pace. 💫</p>
            <p>Log in to the app to get started whenever you’re ready.</p>
            <a href="https://true-love.lovable.app" class="cta">Open the App</a>
          </div>
          <div class="footer">
            This email was sent from a no-reply address. Please do not reply directly.
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
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Email Verification</title>
        <style>
          body {
            background-color: #1a1a1a;
            color: #fff;
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: auto;
            background-color: #262626;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #444;
          }
          .header {
            background-color: #ffcc00;
            padding: 20px;
            text-align: center;
            color: #000;
            font-size: 24px;
            font-weight: bold;
          }
          .content {
            padding: 20px;
            line-height: 1.6;
            text-align: center;
          }
          .highlight {
            color: #ffcc00;
            font-weight: bold;
          }
          .code-box {
            display: inline-block;
            margin: 20px 0;
            padding: 15px 25px;
            font-size: 28px;
            letter-spacing: 8px;
            background-color: #1a1a1a;
            border: 2px dashed #ffcc00;
            border-radius: 8px;
            color: #ffcc00;
            font-weight: bold;
          }
          .footer {
            padding: 15px;
            font-size: 12px;
            color: #888;
            text-align: center;
            background-color: #1a1a1a;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            🔐 Verify Your Email
          </div>
          <div class="content">
            <p>Hi <strong>${user_name}</strong>,</p>
            <p>Welcome to <span class="highlight">True Love Transformation Program</span> 💫</p>
            <p>To complete your registration, please enter the following verification code in the website:</p>
            <div class="code-box">
              ${verification_code}
            </div>
            <p>This code will expire in <strong>15 minutes</strong>. If you didn’t request this, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            This email was sent from a no-reply address. Please do not reply directly.
          </div>
        </div>
      </body>
      </html>
    `;
  },

  // reset password email
  passwordVerificationTemplate: (user_name, reset_code) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Reset Your Password</title>
      <style>
        body {
          background-color: #1a1a1a;
          color: #fff;
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background-color: #262626;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #444;
        }
        .header {
          background-color: #ffcc00;
          padding: 20px;
          text-align: center;
          color: #000;
          font-size: 24px;
          font-weight: bold;
        }
        .content {
          padding: 20px;
          line-height: 1.6;
          text-align: center;
        }
        .highlight {
          color: #ffcc00;
          font-weight: bold;
        }
        .code-box {
          display: inline-block;
          margin: 20px 0;
          padding: 15px 25px;
          font-size: 28px;
          letter-spacing: 8px;
          background-color: #1a1a1a;
          border: 2px dashed #ffcc00;
          border-radius: 8px;
          color: #ffcc00;
          font-weight: bold;
        }
        .footer {
          padding: 15px;
          font-size: 12px;
          color: #888;
          text-align: center;
          background-color: #1a1a1a;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          🔑 Reset Your Password
        </div>
        <div class="content">
          <p>We received a request to reset your password for <span class="highlight">True Love Transformation Program</span>.</p>
          <p>Please use the following code to proceed with resetting your password:</p>
          <div class="code-box">
            ${reset_code}
          </div>
          <p>This code will expire in <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          This email was sent from a no-reply address. Please do not reply directly.
        </div>
      </div>
    </body>
    </html>

    `;
  },

  // password reset sucessful
  paswordResetSucessful: () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Password Reset Successful</title>
        <style>
          body {
            background-color: #1a1a1a;
            color: #fff;
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: auto;
            background-color: #262626;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #444;
          }
          .header {
            background-color: #ffcc00;
            padding: 20px;
            text-align: center;
            color: #000;
            font-size: 24px;
            font-weight: bold;
          }
          .content {
            padding: 20px;
            line-height: 1.6;
            text-align: center;
          }
          .highlight {
            color: #ffcc00;
            font-weight: bold;
          }
          .footer {
            padding: 15px;
            font-size: 12px;
            color: #888;
            text-align: center;
            background-color: #1a1a1a;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            ✅ Password Reset Successful
          </div>
          <div class="content">
            <p>Your password has been <span class="highlight">successfully reset</span> 🎉</p>
            <p>If you didn’t make this change, please <span class="highlight">contact our support immediately</span>.</p>
            <p>For your security, we recommend keeping your password safe and avoiding reusing it on multiple sites.</p>
          </div>
          <div class="footer">
            This email was sent from a no-reply address. Please do not reply directly.
          </div>
        </div>
      </body>
      </html>

    `;
  },
};

// sendEmail(
//   "hamnubulus@gmail.com",
//   "Reset Your Password",
//   templates.passwordVerificationTemplate("Bulus Hamnu", "456786")
// );
