import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { corsOptions } from "../config/cors.js";

export function createSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: corsOptions,
  });

  // Socket event handlers will be registered in later milestones.

  return io;
}
