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
import adminRoutes from "./routes/admin.routes.js";
import errorHandler from "./middlewares/errorHandler.js";
const port = Env.PORT;
const app = express();
import enableMaintenanceMode from "./middlewares/enableMaintenanceMode.js";
import intiateCronJobs from "./crons/cleanup.cron.js";
import { Worker } from "bullmq";
import { mainWorkerProcessor } from "./workers/main.worker.js";

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
app.use("/api/admin", adminRoutes);

/* Error handler */
app.use(errorHandler);

// Intiate database and cron jobs
await connectDb();
await intiateCronJobs();

/* Start worker */
const connection = Env.REDIS_CONNECTION;
const mainWorker = new Worker("main-queue", mainWorkerProcessor, {
  connection,
  concurrency: 5,
});

mainWorker.on("completed", (job) => {
  const data = job.data;
  Logger.info(`${job.name} - job was executed successfully`, data);
});

mainWorker.on("failed", (job) => {
  const data = job.data;
  Logger.error(`An error occured while executing - ${job.name} job.`, data);
});

// Start the server
app.listen(port, async () => {
  Logger.info(`Server listening on: http://localhost:${port}`);
});
