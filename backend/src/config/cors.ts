import type { CorsOptions } from "cors";
import { env } from "./env.js";

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    // Normalize configured client url by removing trailing slashes
    const configuredClient = env.clientUrl.replace(/\/$/, "");
    const allowedOrigins = [
      configuredClient,
      "http://localhost:5173",
      "https://auction-assignment.vercel.app"
    ];

    if (allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
