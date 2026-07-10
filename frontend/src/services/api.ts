const rawApiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";
const sanitizedBaseUrl = rawApiUrl.replace(/\/$/, "");
const API_URL = sanitizedBaseUrl.endsWith("/api") ? sanitizedBaseUrl : `${sanitizedBaseUrl}/api`;

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

export interface AuthResponse {
  username: string;
  role: "admin" | "participant";
}

export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${SERVER_ROOT_URL}/health`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Health check failed");
  }

  return response.json();
}

/**
 * Authentication Endpoints
 */

export async function login(username: string, password?: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error ?? "Failed to log in.");
  }

  return response.json();
}

export async function logout(): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error ?? "Failed to log out.");
  }

  return response.json();
}

export async function checkAuth(): Promise<{ user: AuthResponse | null }> {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    return { user: null };
  }

  return response.json();
}

/**
 * Room Endpoints
 */

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
    credentials: "include",
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
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error ?? "Failed to join room");
  }

  return response.json();
}

export async function getRoom(code: string): Promise<Room> {
  const response = await fetch(`${API_URL}/rooms/${code.toUpperCase()}`, {
    credentials: "include",
  });

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
  currentBid: number;
  highestBidderId?: string | null;
  highestBidderUsername?: string | null;
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
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error ?? "Failed to add auction item.");
  }

  return response.json();
}

export async function getAuctionItems(code: string): Promise<AuctionItem[]> {
  const response = await fetch(`${API_URL}/rooms/${code.toUpperCase()}/items`, {
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error ?? "Failed to fetch auction items.");
  }

  return response.json();
}

export interface Bid {
  _id: string;
  roomId: string;
  itemId: string;
  participantId: string;
  username: string;
  amount: number;
  createdAt: string;
}

export async function getRoomResults(code: string): Promise<AuctionItem[]> {
  const response = await fetch(`${API_URL}/rooms/${code.toUpperCase()}/results`, {
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error ?? "Failed to fetch auction results.");
  }

  return response.json();
}
