import { useEffect, useState } from "react";
import { connectSocket, disconnectSocket } from "../services/socket";
import { useSessionStore } from "../stores/useSessionStore";
import {
  type Participant,
  type Room,
  type AuctionItem,
  type Bid,
  getAuctionItems,
} from "../services/api";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

/**
 * Custom React hook to manage Socket.IO lifecycle, event listeners,
 * and state updates for realtime lobby presence, items, live bidding, and resolutions.
 */
export function useSocket(roomCode: string) {
  const { sessionToken } = useSessionStore();
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [activeItem, setActiveItem] = useState<AuctionItem | null>(null);
  const [activeItemStartedAt, setActiveItemStartedAt] = useState<string | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidError, setBidError] = useState<{ reason: string; minimumBid: number } | null>(null);
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

    const handleConnect = async () => {
      setStatus("connected");
      setError(null);
      // Let the server join us to the room channel and fetch lobby status
      socket.emit("room:connect");

      // Fetch initial upcoming items list via REST API
      try {
        const initialItems = await getAuctionItems(roomCode);
        setItems(initialItems);
      } catch (err: any) {
        console.error("Failed to fetch initial room items:", err);
      }
    };

    const handleDisconnect = () => {
      setStatus("disconnected");
    };

    const handleConnectError = (err: Error) => {
      console.error("Socket connection error:", err);
      setStatus("disconnected");
      setError(err.message ?? "Failed to connect to the realtime server.");
    };

    const handleRoomState = (data: {
      room: Room;
      participants: Participant[];
      activeItem: AuctionItem | null;
      bids?: Bid[];
    }) => {
      setRoom(data.room);
      setParticipants(data.participants);
      if (data.activeItem) {
        setActiveItem(data.activeItem);
      }
      if (data.bids) {
        setBids(data.bids);
      }
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

    const handleItemAdded = (data: { item: AuctionItem }) => {
      setItems((prev) => {
        const exists = prev.some((it) => it._id === data.item._id);
        if (exists) return prev;
        return [...prev, data.item];
      });
    };

    const handleAuctionStarted = (data: { room: Room }) => {
      setRoom(data.room);
    };

    const handleItemActivated = (data: { item: AuctionItem; startedAt: string }) => {
      setActiveItem(data.item);
      setActiveItemStartedAt(data.startedAt);
      setBids([]); // Reset bids timeline for new active item
      setBidError(null);
    };

    const handleBidAccepted = (data: { bid: Bid; item: AuctionItem }) => {
      setActiveItem(data.item);
      setBids((prev) => {
        const exists = prev.some((b) => b._id === data.bid._id);
        if (exists) return prev;
        return [data.bid, ...prev]; // Prepend newest bid to the history
      });
      setBidError(null);
    };

    const handleBidRejected = (data: { reason: string; minimumBid: number }) => {
      setBidError({ reason: data.reason, minimumBid: data.minimumBid });
    };

    const handleItemEnded = () => {
      setBids([]); // Clear local bids log on item resolution
      setBidError(null);
    };

    const handleAuctionCompleted = (data: { room: Room }) => {
      setRoom(data.room);
    };

    // Bind event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("room:state", handleRoomState);
    socket.on("participant:joined", handleParticipantJoined);
    socket.on("participant:left", handleParticipantLeft);
    socket.on("item:added", handleItemAdded);
    socket.on("auction:started", handleAuctionStarted);
    socket.on("item:activated", handleItemActivated);
    socket.on("bid:accepted", handleBidAccepted);
    socket.on("bid:rejected", handleBidRejected);
    socket.on("item:ended", handleItemEnded);
    socket.on("auction:completed", handleAuctionCompleted);

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
      socket.off("item:added", handleItemAdded);
      socket.off("auction:started", handleAuctionStarted);
      socket.off("item:activated", handleItemActivated);
      socket.off("bid:accepted", handleBidAccepted);
      socket.off("bid:rejected", handleBidRejected);
      socket.off("item:ended", handleItemEnded);
      socket.off("auction:completed", handleAuctionCompleted);
      disconnectSocket();
    };
  }, [roomCode, sessionToken]);

  return {
    status,
    room,
    participants,
    items,
    setItems,
    activeItem,
    setActiveItem,
    activeItemStartedAt,
    bids,
    setBids,
    bidError,
    setBidError,
    error,
  };
}
