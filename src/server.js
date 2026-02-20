import express from "express";
import Env from "./config/index.js";
import connectDb from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import selfGuidedRoutes from "./routes/self-guided.routes.js";
import checkOutRoutes from "./routes/checkout.routes.js";
import webhooksRoutes from "./routes/webhook.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import cors from "cors";
const dirname = import.meta.dirname;
import cookieParser from "cookie-parser";
import Logger from "./utils/logger.js";
import publicRoutes from "./routes/public.routes.js";
import errorHandler from "./middlewares/errorHandler.js";
const port = Env.PORT;
const app = express();
import enableMaintenanceMode from "./middlewares/enableMaintenanceMode.js";

/* Middleware */
app.use(helmet());
app.use(express.static(path.join(dirname, "../public")));
app.use(
  morgan("dev", {
    stream: {
      write: (log) => {
        Logger.http(log.trim());
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
  if (req.originalUrl === "/api/webhooks/stripe") {
    return next();
  }
  express.json()(req, res, next);
});

/* Routes */
app.use(enableMaintenanceMode);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/checkouts", checkOutRoutes);
app.use("/api/webhooks", webhooksRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/self-guided-program", selfGuidedRoutes);
app.use("/api/public", publicRoutes);

/* Error handler */
app.use(errorHandler);

// Start the server
app.listen(port, async () => {
  await connectDb();
  Logger.info(`Server listening on: http://localhost:${port}`);
});
