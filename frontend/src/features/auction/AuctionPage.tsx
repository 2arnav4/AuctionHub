import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  Crown,
  Users,
  AlertCircle,
  Tag,
  MessageSquare,
  DollarSign,
  Info,
} from "lucide-react";
import { PageContainer } from "../../components/ui/PageContainer";
import { Button } from "../../components/ui/Button";
import { useSessionStore } from "../../stores/useSessionStore";
import { useSocket } from "../../hooks/useSocket";

export function AuctionPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const {
    roomCode: sessionRoomCode,
    username: sessionUsername,
    role: sessionRole,
    clearSession,
  } = useSessionStore();

  // Connect to Socket.IO to track live bidding item and presence status
  const {
    status: socketStatus,
    room,
    participants,
    activeItem,
    error: socketError,
  } = useSocket(code || "");

  // Security check: Redirect if the user has no session or is in the wrong room
  const hasNoAccess = !sessionUsername || !sessionRole || sessionRoomCode !== code;

  const handleLeaveRoom = () => {
    clearSession();
    navigate("/");
  };

  const isLoading = !room && socketStatus === "connecting";

  if (isLoading) {
    return (
      <PageContainer className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent/20 opacity-75" />
            <div className="relative rounded-full h-8 w-8 bg-accent/20 flex items-center justify-center">
              <Clock className="h-4 w-4 text-accent animate-spin" />
            </div>
          </div>
          <p className="text-sm text-text-secondary">Establishing live auction connection...</p>
        </div>
      </PageContainer>
    );
  }

  if (socketError || (!room && socketStatus === "disconnected")) {
    return (
      <PageContainer className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="border border-border bg-surface-raised/40 p-8 rounded-xl text-center max-w-md mx-auto space-y-6 shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-text-primary">Realtime Connection Failed</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {socketError ?? "Failed to connect to the live auction room. Check if the server is running."}
            </p>
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
            <h2 className="text-xl font-semibold text-text-primary">Access Denied</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              You are trying to access room <span className="font-mono text-accent font-semibold">{code}</span> but do not have an active session. Please register to join.
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
    <PageContainer className="px-4 py-12 sm:px-6 sm:py-16 max-w-5xl">
      <div className="space-y-8">
        
        {/* Connection status header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-red-500 mr-2">
                LIVE AUCTION
              </span>
              {socketStatus === "connected" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Synced
                </span>
              )}
              {socketStatus === "connecting" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Reconnecting...
                </span>
              )}
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
            Leave Auction
          </Button>
        </div>

        {/* Live Auction Board Layout */}
        <div className="grid gap-6 md:grid-cols-3 items-start">
          
          {/* Active Item Container (2/3 width) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Current Item Presentation */}
            <div className="border border-border bg-surface-raised/40 p-6 rounded-xl space-y-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-accent/5 blur-[30px] pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                  <Tag className="h-4 w-4 text-accent" />
                  Current Active Item
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-500/15 border border-green-500/30 px-2.5 py-0.5 rounded-full">
                  Bidding Open
                </span>
              </div>

              {!activeItem ? (
                <div className="py-12 text-center space-y-3">
                  <Clock className="h-10 w-10 text-text-muted mx-auto animate-pulse" />
                  <h3 className="text-base font-semibold text-text-primary">Waiting for item activation...</h3>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto">
                    The room has started. The administrator is currently preparing the first item details to open the bid.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-text-primary tracking-tight">
                      {activeItem.name}
                    </h2>
                    {activeItem.description ? (
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {activeItem.description}
                      </p>
                    ) : (
                      <p className="text-xs text-text-muted italic">No item details provided.</p>
                    )}
                  </div>

                  {/* Pricing Box */}
                  <div className="grid grid-cols-2 gap-4 bg-surface-overlay/60 border border-border/50 p-4 rounded-lg">
                    <div>
                      <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                        Starting Bid Price
                      </span>
                      <span className="text-xl font-bold text-text-primary tracking-tight">
                        ₹{activeItem.startingBid.toLocaleString()}
                      </span>
                    </div>
                    <div className="border-l border-border/40 pl-4">
                      <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                        Current Highest Bid
                      </span>
                      <span className="text-xl font-bold text-accent tracking-tight">
                        ₹{activeItem.startingBid.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mock Bidding Form Box (Functional in Next Milestone) */}
            <div className="border border-border bg-surface-raised/40 p-6 rounded-xl space-y-4 shadow-lg">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2 border-b border-border/40 pb-3">
                <DollarSign className="h-4 w-4 text-accent" />
                Place Your Bid
              </span>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted">₹</span>
                  <input
                    type="number"
                    disabled
                    placeholder={`e.g. ${activeItem ? activeItem.startingBid + 100 : 500}`}
                    className="w-full bg-surface-overlay border border-border/80 focus:border-accent/50 focus:ring-1 focus:ring-accent/20 rounded-lg pl-8 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-all outline-none"
                  />
                </div>
                <Button disabled variant="primary" className="py-2.5 px-6 font-bold cursor-not-allowed">
                  Submit Bid
                </Button>
              </div>

              <div className="flex items-start gap-2 text-[11px] text-text-muted bg-surface-overlay/20 border border-border/30 p-3 rounded-lg leading-relaxed">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent" />
                <p>
                  Bidding is currently inactive. In the next milestone, realtime bidding logic, bids lists, and countdown timers will become active.
                </p>
              </div>
            </div>
          </div>

          {/* Bidders sidebar (1/3 width) */}
          <div className="space-y-6">
            
            {/* Live active participants connection presence */}
            <div className="border border-border bg-surface-raised/40 p-6 rounded-xl space-y-4 shadow-lg min-h-[300px] flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2 border-b border-border/40 pb-3">
                <Users className="h-4 w-4 text-accent" />
                Connected Bidders ({participants.length})
              </span>

              <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                {participants.map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between bg-surface-overlay/20 border border-border/30 p-2.5 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="h-6 w-6 rounded-full bg-surface-overlay border border-border flex items-center justify-center font-medium text-[10px] text-text-secondary shrink-0">
                        {p.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-text-primary truncate">
                          {p.username}
                          {p.username === sessionUsername && (
                            <span className="ml-1 text-[9px] text-text-muted">(You)</span>
                          )}
                        </p>
                        {p.role === "admin" ? (
                          <span className="text-[9px] text-amber-400 font-medium flex items-center gap-0.5">
                            <Crown className="h-2.5 w-2.5" />
                            Host
                          </span>
                        ) : (
                          <span className="text-[9px] text-accent font-medium">Bidder</span>
                        )}
                      </div>
                    </div>

                    {p.isConnected ? (
                      <span className="inline-flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" title="Online" />
                    ) : (
                      <span className="inline-flex h-2 w-2 rounded-full bg-zinc-500" title="Offline" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Live Message Log placeholder */}
            <div className="border border-border bg-surface-raised/40 p-6 rounded-xl space-y-4 shadow-lg">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2 border-b border-border/40 pb-3">
                <MessageSquare className="h-4 w-4 text-accent" />
                Live Feed
              </span>

              <div className="h-28 overflow-y-auto space-y-2 text-[10px] text-text-muted flex flex-col justify-end">
                <p className="italic">Room initialized. Auction timer preparing...</p>
                {activeItem && (
                  <p className="text-text-secondary font-medium">
                    ✦ Item <span className="text-accent">{activeItem.name}</span> activated.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
