import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SessionState {
  roomCode: string | null;
  sessionToken: string | null;
  username: string | null;
  participantId: string | null;
  role: "admin" | "participant" | null;
  authUser: { username: string; role: "admin" | "participant" } | null;
  setSession: (session: {
    roomCode: string;
    sessionToken: string;
    username: string;
    participantId: string;
    role: "admin" | "participant";
  }) => void;
  /** Clears the room membership but keeps the user signed in. */
  clearRoomSession: () => void;
  /** Clears room membership and the signed-in user. Used by logout. */
  clearSession: () => void;
  setAuthUser: (
    user: { username: string; role: "admin" | "participant" } | null,
  ) => void;
}

const EMPTY_ROOM_SESSION = {
  roomCode: null,
  sessionToken: null,
  username: null,
  participantId: null,
  role: null,
} as const;

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      roomCode: null,
      sessionToken: null,
      username: null,
      participantId: null,
      role: null,
      authUser: null,
      setSession: (session) => set(session),
      clearRoomSession: () => set({ ...EMPTY_ROOM_SESSION }),
      clearSession: () => set({ ...EMPTY_ROOM_SESSION, authUser: null }),
      setAuthUser: (user) => set({ authUser: user }),
    }),
    {
      name: "auction-session", // Key used in localStorage
    },
  ),
);
