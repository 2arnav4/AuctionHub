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
  clearSession: () => void;
  setAuthUser: (user: { username: string; role: "admin" | "participant" } | null) => void;
}

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
      clearSession: () =>
        set({
          roomCode: null,
          sessionToken: null,
          username: null,
          participantId: null,
          role: null,
        }),
      setAuthUser: (user) => set({ authUser: user }),
    }),
    {
      name: "auction-session", // Key used in localStorage
    }
  )
);
