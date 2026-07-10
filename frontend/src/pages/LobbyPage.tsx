import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Copy, Check, LogOut, Clock, Users, Crown, AlertCircle } from "lucide-react";
import { PageContainer } from "../components/ui/PageContainer";
import { Button } from "../components/ui/Button";
import { getRoom, type Room } from "../services/api";
import { useSessionStore } from "../stores/useSessionStore";

export function LobbyPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const {
    roomCode: sessionRoomCode,
    username,
    role,
    clearSession,
  } = useSessionStore();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Load room details from API
  useEffect(() => {
    if (!code) return;

    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        const roomDetails = await getRoom(code);
        setRoom(roomDetails);
      } catch (err: any) {
        setError(err.message ?? "Failed to load room details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [code]);

  // Security & redirection check:
  // If the user has no session, or if their session is for a different room,
  // we redirect them to join the room properly, or show an onboarding prompt.
  const hasNoAccess = !username || !role || sessionRoomCode !== code;

  const handleCopyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleLeaveRoom = () => {
    clearSession();
    navigate("/");
  };

  if (loading) {
    return (
      <PageContainer className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent/20 opacity-75" />
            <div className="relative rounded-full h-8 w-8 bg-accent/20 flex items-center justify-center">
              <Clock className="h-4 w-4 text-accent animate-spin" />
            </div>
          </div>
          <p className="text-sm text-text-secondary">Loading lobby details...</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="border border-border bg-surface-raised/40 p-8 rounded-xl text-center max-w-md mx-auto space-y-6 shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-text-primary">Error Loading Lobby</h2>
            <p className="text-sm text-text-secondary leading-relaxed">{error}</p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/")} className="w-full">
            Back to Home
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (hasNoAccess) {
    return (
      <PageContainer className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="border border-border bg-surface-raised/40 p-8 rounded-xl text-center max-w-md mx-auto space-y-6 shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Users className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-text-primary">Enter Room Session</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              You are trying to access room <span className="font-mono text-accent font-semibold">{code}</span> but do not have an active session. Please join the room with a username to proceed.
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate(`/join?code=${code}`)} className="w-full">
            Join Room
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Lobby Active
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              {room?.name}
            </h1>
          </div>
          <Button
            variant="ghost"
            onClick={handleLeaveRoom}
            className="self-start sm:self-center border border-border/50 text-xs text-text-secondary hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
          >
            <LogOut className="h-3.5 w-3.5" />
            Leave Lobby
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          {/* Room Code Card (3/5 width) */}
          <div className="md:col-span-3 border border-border bg-surface-raised/40 backdrop-blur-md p-6 rounded-xl space-y-6 flex flex-col justify-between shadow-lg">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Invite Code
              </span>
              <p className="text-sm text-text-secondary leading-relaxed">
                Share this unique room code with bidders to let them join the auction lobby.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-surface-overlay/80 border border-border/60 p-3 rounded-lg font-mono">
              <span className="text-2xl font-bold tracking-widest text-text-primary flex-1 text-center">
                {code}
              </span>
              <button
                onClick={handleCopyCode}
                className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface-raised transition-all hover:bg-surface-overlay hover:border-accent"
                title="Copy code"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 text-text-secondary" />
                )}
              </button>
            </div>
          </div>

          {/* User Profile Card (2/5 width) */}
          <div className="md:col-span-2 border border-border bg-surface-raised/40 backdrop-blur-md p-6 rounded-xl space-y-6 flex flex-col justify-between shadow-lg">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Your Connection
              </span>
              <p className="text-sm text-text-secondary leading-relaxed">
                You are registered in this room with the profile below.
              </p>
            </div>

            <div className="space-y-3 bg-surface-overlay/40 border border-border/40 p-4 rounded-lg">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent font-semibold text-sm">
                  {username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-sm font-semibold text-text-primary truncate">
                    {username}
                  </h4>
                  <p className="text-xs text-text-muted truncate">Active Bidding Session</p>
                </div>
              </div>

              <div className="border-t border-border/30 pt-2.5 flex items-center justify-between">
                <span className="text-xs text-text-muted">Role</span>
                {role === "admin" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    <Crown className="h-3 w-3" />
                    Room Host
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
                    <Users className="h-3 w-3" />
                    Bidder
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pulse Loading Indicator */}
        <div className="border border-border/60 bg-surface-raised/20 p-8 rounded-xl text-center space-y-4 shadow-sm relative overflow-hidden">
          {/* Decorative glowing gradient background */}
          <div className="absolute left-1/2 top-1/2 h-36 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[50px] pointer-events-none" />

          <div className="relative flex flex-col items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <Clock className="h-5 w-5 text-accent animate-pulse" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-semibold text-text-primary">
                {role === "admin"
                  ? "Waiting for participants to join..."
                  : "Waiting for host to start the auction..."}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                {role === "admin"
                  ? "Bidders are entering the lobby. The auction controls will become active here in the next milestone once websocket syncing is connected."
                  : "Stay on this page. Once the host launches the auction, you will be automatically redirected to the bidding screen."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
