import { useEffect, useState } from "react";
import { connectSocket, disconnectSocket } from "../services/socket";
import { useSessionStore } from "../stores/useSessionStore";
import { type Participant, type Room } from "../services/api";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

/**
 * Custom React hook to manage Socket.IO lifecycle, event listeners,
 * and state updates for realtime lobby presence.
 */
export function useSocket(roomCode: string) {
  const { sessionToken } = useSessionStore();
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomCode || !sessionToken) {
      setError("Active session not found. Cannot connect to socket.");
      setStatus("disconnected");
      return;
    }

    // Initialize/retrieve socket connection
    const socket = connectSocket(roomCode, sessionToken);

    // Sync initial state
    setStatus(socket.connected ? "connected" : "connecting");

    const handleConnect = () => {
      setStatus("connected");
      setError(null);
      // Let the server join us to the room channel and fetch lobby status
      socket.emit("room:connect");
    };

    const handleDisconnect = () => {
      setStatus("disconnected");
    };

    const handleConnectError = (err: Error) => {
      console.error("Socket connection error:", err);
      setStatus("disconnected");
      setError(err.message ?? "Failed to connect to the realtime server.");
    };

    const handleRoomState = (data: { room: Room; participants: Participant[] }) => {
      setRoom(data.room);
      setParticipants(data.participants);
    };

    const handleParticipantJoined = (data: { participant: Participant }) => {
      setParticipants((prev) => {
        const exists = prev.some((p) => p._id === data.participant._id);
        if (exists) {
          // If participant is already in the list, set them to connected
          return prev.map((p) =>
            p._id === data.participant._id ? { ...p, isConnected: true } : p
          );
        } else {
          // If they are a new participant, append them to the list
          return [...prev, data.participant];
        }
      });
    };

    const handleParticipantLeft = (data: { participant: Participant }) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p._id === data.participant._id ? { ...p, isConnected: false } : p
        )
      );
    };

    // Bind event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("room:state", handleRoomState);
    socket.on("participant:joined", handleParticipantJoined);
    socket.on("participant:left", handleParticipantLeft);

    // If socket is already connected when this hook mounts, trigger connect handler
    if (socket.connected) {
      handleConnect();
    }

    // Cleanup listeners and connection when the hook component unmounts
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("room:state", handleRoomState);
      socket.off("participant:joined", handleParticipantJoined);
      socket.off("participant:left", handleParticipantLeft);
      disconnectSocket();
    };
  }, [roomCode, sessionToken]);

  return {
    status,
    room,
    participants,
    error,
  };
}
