const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

// Health route is served from the root of the server
const SERVER_ROOT_URL = API_URL.endsWith("/api")
  ? API_URL.slice(0, -4)
  : API_URL;

export interface Room {
  _id: string;
  code: string;
  name: string;
  status: "lobby" | "live" | "completed";
  adminParticipantId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  _id: string;
  roomId: string;
  username: string;
  role: "admin" | "participant";
  sessionToken: string;
  isConnected: boolean;
  joinedAt: string;
}

export interface RoomResponse {
  room: Room;
  participant: Participant;
  sessionToken: string;
}

export interface JoinResponse {
  room: Room;
  participant: Participant;
  sessionToken: string;
}

export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${SERVER_ROOT_URL}/health`);

  if (!response.ok) {
    throw new Error("Health check failed");
  }

  return response.json();
}

export async function createRoom(
  username: string,
  roomName: string
): Promise<RoomResponse> {
  const response = await fetch(`${API_URL}/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, roomName }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error ?? "Failed to create room");
  }

  return response.json();
}

export async function joinRoom(
  code: string,
  username: string
): Promise<JoinResponse> {
  const response = await fetch(`${API_URL}/rooms/${code.toUpperCase()}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error ?? "Failed to join room");
  }

  return response.json();
}

export async function getRoom(code: string): Promise<Room> {
  const response = await fetch(`${API_URL}/rooms/${code.toUpperCase()}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error ?? "Failed to fetch room details");
  }

  return response.json();
}

export interface AuctionItem {
  _id: string;
  roomId: string;
  name: string;
  description?: string;
  startingBid: number;
  status: "pending" | "active" | "sold" | "unsold";
  createdAt: string;
  updatedAt: string;
}

export async function addAuctionItem(
  code: string,
  sessionToken: string,
  name: string,
  description: string,
  startingBid: number
): Promise<AuctionItem> {
  const response = await fetch(`${API_URL}/rooms/${code.toUpperCase()}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-session-token": sessionToken,
    },
    body: JSON.stringify({ name, description, startingBid }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error ?? "Failed to add auction item.");
  }

  return response.json();
}

export async function getAuctionItems(code: string): Promise<AuctionItem[]> {
  const response = await fetch(`${API_URL}/rooms/${code.toUpperCase()}/items`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error ?? "Failed to fetch auction items.");
  }

  return response.json();
}

