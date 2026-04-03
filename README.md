# True Love App – Backend (Node.js)

## Overview

This is the backend system for the True Love app, a production platform used for relationship coaching programs and digital products.

I was responsible for building and improving the backend system, including authentication, payments, and system reliability. The frontend was built using Lovable, while I was responsible for designing and implementing the backend system.

> Note: This backend was developed as part of my work with a company, where I was responsible for building and maintaining the system.

---

## Tech Stack

- Node.js / Express
- MongoDB (Mongoose)
- Stripe (payments)
- Redis + BullMQ (queues & cron jobs)
- Resend (emails)
- Joi (validation)

---

## Key Features

### Authentication System

- Email/password signup & login
- Google OAuth integration
- Email verification flow
- Password reset system
- Refresh token handling

---

### Payments & Checkout

- Stripe Checkout integration
- Webhook handling for payment confirmation
- Transaction recording system
- Support for multiple product types (coaching & self-guided)

---

### Idempotency & Reliability

- Implemented idempotency keys for safe payment retries
- Prevents duplicate transactions
- Handles race conditions during checkout

---

### Background Jobs & Cron

- Queue system using BullMQ + Redis
- Email sending handled asynchronously
- Cron job to clean expired idempotency keys

> Note: Worker runs in same process due to hosting limits (Render sleep behavior)

---

### User & Program System

- Auto-create user during checkout (no signup required)
- Self-guided program with:
  - Weekly progress tracking
  - Reflection messages
  - GPT-assisted responses (OpenAI integration)

---

### Security & Middleware

- Helmet (security headers)
- CORS configuration
- Rate limiting
- XSS sanitization
- Centralized error handling

---

### Database Design

- Structured MongoDB models:
  - User
  - Profile
  - Transactions
  - Self-guided programs
  - Idempotency keys

- Used transactions to maintain data integrity

## Live Demo

Link: [True-love-app](https://true-love.app/)
