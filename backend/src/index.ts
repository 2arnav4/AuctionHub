import { createServer } from "http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { createSocketServer } from "./socket/index.js";

// Establish MongoDB connection
await connectDB();

const app = createApp();
const httpServer = createServer(app);

createSocketServer(httpServer);

httpServer.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});
