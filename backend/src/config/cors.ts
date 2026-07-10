import type { CorsOptions } from "cors";
import { env } from "./env.js";

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    // Normalize configured client url by removing trailing slashes
    const configuredClient = env.clientUrl.replace(/\/$/, "");
    const allowedOrigins = env.isDevelopment
      ? [configuredClient, "http://localhost:5173"]
      : [configuredClient];

    if (allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
