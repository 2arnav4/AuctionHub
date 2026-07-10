import { io, Socket } from "socket.io-client";

const rawApiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";
const sanitizedBaseUrl = rawApiUrl.replace(/\/$/, "");
const SOCKET_URL = sanitizedBaseUrl.endsWith("/api") ? sanitizedBaseUrl.slice(0, -4) : sanitizedBaseUrl;

let socket: Socket | null = null;

/**
 * Connects the socket to the backend server with handshake authentication parameters.
 */
export function connectSocket(roomCode: string, sessionToken: string): Socket {
  // If socket already exists, return or connect it
  if (socket) {
    if (socket.connected) {
      return socket;
    }
    socket.connect();
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      roomCode,
      sessionToken,
    },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
}

/**
 * Disconnects the socket connection and cleans up the instance.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Returns the active socket instance.
 */
export function getSocket(): Socket | null {
  return socket;
}
