import express from "express";
import Env from "./config/index.js";
import connectDb from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import selfGuidedRoutes from "./routes/self-guided.routes.js";
import checkOutRoutes from "./routes/checkout.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import cors from "cors";
const dirname = import.meta.dirname;
import cookieParser from "cookie-parser";
import { logger } from "./utils/helpers.js";
import getAppStats from "./controllers/get-app-stats.controller.js";
import errorHandler from "./middlewares/errorHandler.js";
const port = Env.PORT;
const app = express();

// Middleware
app.use(helmet());
app.use(express.static(path.join(dirname, "../public")));
app.use(
  morgan("dev", {
    stream: {
      write: (log) => {
        logger.http(log.trim());
      },
    },
  }),
);
app.use(
  cors({
    origin: "https://true-love.app",
    credentials: true,
  }),
);
app.use(cookieParser());
app.set("trust proxy", true);
app.use((req, res, next) => {
  // skip json parsing for stripe webhook route
  if (req.originalUrl === "/api/checkout/stripe-webhook") {
    return next();
  }
  express.json()(req, res, next);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/me", profileRoutes);
app.use("/api/checkout", checkOutRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/self-guided", selfGuidedRoutes);
app.get("/api/monitor", getAppStats);

// Error handler
app.use(errorHandler);

// Start the server
app.listen(port, async () => {
  await connectDb();
  logger.info(`Server listening on: http://localhost:${port}`);
});
