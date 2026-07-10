import cors from "cors";
import express from "express";
import { corsOptions } from "./config/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";
import { healthRouter } from "./routes/health.routes.js";

export function createApp() {
  const app = express();

  app.use(cors(corsOptions));
  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/api", apiRouter);

  app.use(errorHandler);

  return app;
}
