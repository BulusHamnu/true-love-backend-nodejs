import express from "express";
import { env, stripe } from "./confiq/index.js";
import { logInfo, logError } from "./src/utils/helpers.js";
import connectDb from "./confiq/db.js";
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
app.use(express.json());

// App routes
app.get("/", (req, res) => {
  res.sendFile(path.join(dirname, "views", "index.html"));
});

// Start the server
app.listen(port, async () => {
  await connectDb();
  logInfo(`Server listening on: ${env.BACKEND_URL + port}`);
});
