import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { corsOptions } from "../config/cors.js";
import { socketAuthMiddleware } from "./middleware/auth.js";
import { registerRoomHandlers } from "./handlers/room.handler.js";

export function createSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: corsOptions,
  });

  // Apply authentication middleware to incoming connections
  io.use(socketAuthMiddleware);

  // Listen for socket connections and register event handlers
  io.on("connection", (socket) => {
    registerRoomHandlers(io, socket);
  });

  return io;
}
