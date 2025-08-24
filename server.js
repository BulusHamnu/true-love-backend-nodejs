import express from "express";
import { env, stripe } from "./confiq/index.js";
import { logInfo, logError } from "./src/utils/helpers.js";
import connectDb from "./confiq/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import paymentRoutes from "./src/routes/payment.js";
import morgan from "morgan";
import path from "path";
const dirname = import.meta.dirname;
import cookieParser from "cookie-parser";
const port = env.PORT;
const app = express();

// App middleware
app.use("/public", express.static(path.join(dirname, "public")));
app.use(morgan("dev"));
app.use(cookieParser());
app.use((req, res, next) => {
  // skip json parsing for stripe webhook route
  if (req.originalUrl === "/api/payment/stripe-webhook") {
    return next();
  }
  express.json()(req, res, next);
});

// App routes
app.get("/", (req, res) => {
  res.sendFile(path.join(dirname, "views", "index.html"));
});

// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/me", profileRoutes);
app.use("/api/payment", paymentRoutes);

// Start the server
app.listen(port, async () => {
  await connectDb();
  logInfo(`Server listening on: http://localhost:${port}`);
});
