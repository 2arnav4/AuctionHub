import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  Crown,
  Users,
  AlertCircle,
  Tag,
  MessageSquare,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { PageContainer } from "../../components/ui/PageContainer";
import { Button } from "../../components/ui/Button";
import { useSessionStore } from "../../stores/useSessionStore";
import { useSocket } from "../../hooks/useSocket";
import { getSocket } from "../../services/socket";

export function AuctionPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const {
    roomCode: sessionRoomCode,
    username: sessionUsername,
    role: sessionRole,
    clearSession,
  } = useSessionStore();

  // Connect to Socket.IO to track live bidding item, presence, and bids history
  const {
    status: socketStatus,
    room,
    participants,
    activeItem,
    bids,
    bidError,
    setBidError,
    error: socketError,
  } = useSocket(code || "");

  const [bidVal, setBidVal] = useState("");
  const [localBidErr, setLocalBidErr] = useState<string | null>(null);

  // Security check: Redirect if the user has no session or is in the wrong room
  const hasNoAccess = !sessionUsername || !sessionRole || sessionRoomCode !== code;

  // Automatically navigate to results page when room transitions to completed status
  useEffect(() => {
    if (room?.status === "completed" && code) {
      navigate(`/results/${code}`);
    }
  }, [room?.status, code, navigate]);

  // Clear local bid validation messages when active item changes
  useEffect(() => {
    setLocalBidErr(null);
    setBidVal("");
  }, [activeItem?._id]);

  const handleLeaveRoom = () => {
    clearSession();
    navigate("/");
  };

  // Submit new bid (Participants only)
  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    const bidAmount = Number(bidVal);
    const currentPrice = activeItem.currentBid ?? activeItem.startingBid ?? 0;
    const minBidRequired = currentPrice + 1;

    if (isNaN(bidAmount) || bidAmount < minBidRequired) {
      setLocalBidErr(`Bid must be at least ₹${minBidRequired.toLocaleString()}`);
      return;
    }

    setLocalBidErr(null);
    setBidError(null);

    const socket = getSocket();
    if (socket) {
      socket.emit("bid:place", { amount: bidAmount });
    }
    setBidVal(""); // Reset input field
  };

  // Sell active item (Admin only)
  const handleSellItem = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit("item:sell");
    }
  };

  // Mark active item unsold (Admin only)
  const handleMarkUnsold = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit("item:unsold");
    }
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

  const isAdmin = sessionRole === "admin";
  const minBidVal = activeItem ? (activeItem.currentBid ?? activeItem.startingBid ?? 0) + 1 : 1;

  return (
    <PageContainer className="px-4 py-12 sm:px-6 sm:py-16 max-w-5xl">
      <div className="space-y-8">
        
        {/* Connection status header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-red-500 mr-2">
                LIVE AUCTION
              </span>
              {socketStatus === "connected" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
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
            Leave Room
          </Button>
        </div>

        {/* Host Control center resolving controls (Visible to Admin only) */}
        {isAdmin && activeItem && (
          <div className="border border-amber-500/20 bg-amber-500/5 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-sm font-semibold text-amber-400 flex items-center justify-center sm:justify-start gap-1.5">
                <Crown className="h-4 w-4" />
                Host Resolution Console
              </h3>
              <p className="text-xs text-text-secondary">
                Resolve the current item's bid. The next pending item in queue will activate automatically.
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={handleSellItem}
                variant="primary"
                className="flex-1 sm:flex-initial bg-green-500 hover:bg-green-600 border-green-500/20 text-zinc-950 font-bold text-xs"
              >
                Sell Item (₹{(activeItem.currentBid ?? activeItem.startingBid ?? 0).toLocaleString()})
              </Button>
              <Button
                onClick={handleMarkUnsold}
                variant="secondary"
                className="flex-1 sm:flex-initial text-xs border border-border/50"
              >
                Mark Unsold
              </Button>
            </div>
          </div>
        )}

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
                  Active Auction Item
                </span>
                {activeItem && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-500/15 border border-green-500/30 px-2.5 py-0.5 rounded-full">
                    Bidding Open
                  </span>
                )}
              </div>

              {!activeItem ? (
                <div className="py-12 text-center space-y-3">
                  <Clock className="h-10 w-10 text-text-muted mx-auto animate-pulse" />
                  <h3 className="text-base font-semibold text-text-primary">Waiting for item activation...</h3>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto">
                    The host is resolving items. Bidding will open immediately once the next item activates.
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
                        Starting Price
                      </span>
                      <span className="text-xl font-bold text-text-primary tracking-tight">
                        ₹{(activeItem.startingBid ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="border-l border-border/40 pl-4">
                      <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                        Highest Bid
                      </span>
                      <span className="text-xl font-bold text-accent tracking-tight">
                        ₹{(activeItem.currentBid ?? activeItem.startingBid ?? 0).toLocaleString()}
                      </span>
                      {activeItem.highestBidderUsername ? (
                        <span className="text-[10px] font-medium text-green-400 block mt-0.5 truncate">
                          by {activeItem.highestBidderUsername}
                        </span>
                      ) : (
                        <span className="text-[10px] text-text-muted block mt-0.5">
                          No bids placed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bidding Placement input Box (Visible to Bidders only) */}
            {!isAdmin && activeItem && (
              <div className="border border-border bg-surface-raised/40 p-6 rounded-xl space-y-4 shadow-lg">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2 border-b border-border/40 pb-3">
                  <DollarSign className="h-4 w-4 text-accent" />
                  Place Bid
                </span>

                <form onSubmit={handleSubmitBid} className="space-y-4">
                  {(localBidErr || bidError) && (
                    <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <p>{localBidErr || bidError?.reason}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted">₹</span>
                      <input
                        type="number"
                        required
                        min={minBidVal}
                        placeholder={`Min bid required: ₹${(minBidVal ?? 1).toLocaleString()}`}
                        value={bidVal}
                        onChange={(e) => {
                          setBidVal(e.target.value);
                          setLocalBidErr(null);
                        }}
                        className="w-full bg-surface-overlay border border-border/80 focus:border-accent/50 focus:ring-1 focus:ring-accent/20 rounded-lg pl-8 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-all outline-none"
                      />
                    </div>
                    <Button type="submit" variant="primary" className="py-2.5 px-6 font-bold text-sm">
                      Submit Bid
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar Section (1/3 width) */}
          <div className="space-y-6">
            
            {/* Bid History list timeline */}
            <div className="border border-border bg-surface-raised/40 p-6 rounded-xl space-y-4 shadow-lg min-h-[220px] flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2 border-b border-border/40 pb-3">
                <TrendingUp className="h-4 w-4 text-accent" />
                Live Bids Log ({bids.length})
              </span>

              {bids.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-1 text-text-muted">
                  <DollarSign className="h-6 w-6 stroke-[1.5]" />
                  <p className="text-xs">No bids logged yet</p>
                </div>
              ) : (
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[220px] pr-1">
                  {bids.map((b) => (
                    <div
                      key={b._id}
                      className="flex items-center justify-between bg-surface-overlay/40 border border-border/30 px-3 py-2 rounded-lg text-xs"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="h-5 w-5 rounded-full bg-accent/10 flex items-center justify-center font-bold text-[9px] text-accent shrink-0">
                          {b.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-text-primary truncate">{b.username}</span>
                      </div>
                      <span className="font-bold text-accent shrink-0">
                        ₹{b.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bidders Connection Sidebar */}
            <div className="border border-border bg-surface-raised/40 p-6 rounded-xl space-y-4 shadow-lg flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2 border-b border-border/40 pb-3">
                <Users className="h-4 w-4 text-accent" />
                Lobby Presence ({participants.length})
              </span>

              <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                {participants.map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between bg-surface-overlay/20 border border-border/30 p-2.5 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="h-5.5 w-5.5 rounded-full bg-surface-overlay border border-border flex items-center justify-center font-medium text-[9px] text-text-secondary shrink-0">
                        {p.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-text-primary truncate">
                          {p.username}
                          {p.username === sessionUsername && (
                            <span className="ml-1 text-[8px] text-text-muted">(You)</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {p.isConnected ? (
                      <span className="inline-flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    ) : (
                      <span className="inline-flex h-2 w-2 rounded-full bg-zinc-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notification logs panel */}
            <div className="border border-border bg-surface-raised/40 p-6 rounded-xl space-y-4 shadow-lg">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2 border-b border-border/40 pb-3">
                <MessageSquare className="h-4 w-4 text-accent" />
                Live Broadcasts
              </span>

              <div className="h-20 overflow-y-auto space-y-1.5 text-[10px] text-text-muted flex flex-col justify-end">
                {activeItem && (
                  <p className="text-text-secondary font-medium">
                    ✦ Item <span className="text-accent">{activeItem.name}</span> is active. Minimum bid: ₹{(minBidVal ?? 1).toLocaleString()}.
                  </p>
                )}
                {bids.length > 0 && (
                  <p className="text-green-400">
                    ✔ Bid of ₹{(bids[0].amount ?? 0).toLocaleString()} accepted for {bids[0].username}.
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
