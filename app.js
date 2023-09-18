/* "dependencies": {
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^10.0.0",
  "express": "^4.17.1",
  "express-async-errors": "^3.1.1",
  "express-rate-limit": "^5.3.0",
  "helmet": "^4.6.0",
  "http-status-codes": "^2.1.4",
  "joi": "^17.4.0",
  "jsonwebtoken": "^8.5.1",
  "mongoose": "^5.13.2",
  "rate-limiter": "^0.2.0",
  "swagger-ui-express": "^4.1.6",
  "xss-clean": "^0.1.1",
  "yamljs": "^0.3.0"
},
"devDependencies": {
  "nodemon": "^2.0.9"
} */

/* require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.use(express.json());
// extra packages

// routes
app.get("/", (req, res) => {
  res.send("jobs api");
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
 */

import express from "express";
import { handleDBConnect } from "./db/connect.js";
const app = express();
import { info, success, error, warning } from "./colors.js";
import { notFound } from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import { router as authRouter } from "./routes/auth.js";
import { router as jobsRouter } from "./routes/jobs.js";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import { isAuthenticated } from "./middleware/authentication.js";
//import { xss } from "express-xss-sanitizer";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
handleDBConnect(startServer);

const PORT = process.env.PORT || 3000;

function startServer() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  app.set("trust proxy", 1);
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    })
  );
  //app.use(xss())
  app.use(helmet());
  app.options("*", cors());
  app.use(cors());
  app.use(cookieParser());

  app.use(express.static(path.resolve(__dirname, "public")));
  app.use(express.json());

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/jobs", isAuthenticated, jobsRouter);

  app.use(notFound);
  app.use(errorHandlerMiddleware);

  try {
    app.listen(PORT, () => {
      success(`Server is listening on PORT ${PORT}`, "bold");
    });
  } catch (error) {
    error(err);
  }
}
