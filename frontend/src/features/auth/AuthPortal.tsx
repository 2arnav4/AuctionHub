import { useState } from "react";
import { LogIn, ShieldAlert, Key, User, HelpCircle } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useSessionStore } from "../../stores/useSessionStore";
import { login } from "../../services/api";

export function AuthPortal() {
  const setAuthUser = useSessionStore((state) => state.setAuthUser);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent, customUser?: string, customPass?: string) => {
    if (e) e.preventDefault();

    const targetUser = customUser ?? username;
    const targetPass = customPass ?? password;

    if (!targetUser.trim()) {
      setError("Please specify a username.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await login(targetUser.trim(), targetPass);
      setAuthUser(data);
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message ?? "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const triggerQuickDemo = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    handleLoginSubmit(null as any, user, pass);
  };

  return (
    <section className="px-4 pb-20 sm:px-6 sm:pb-28">
      <div className="mx-auto max-w-md w-full animate-fade-in-up-delay-3">
        <form
          onSubmit={(e) => handleLoginSubmit(e)}
          className="border border-border bg-surface-raised/40 backdrop-blur-md p-6 rounded-xl space-y-6 shadow-xl"
        >
          <div className="border-b border-border/40 pb-4 text-center">
            <h2 className="text-lg font-bold text-text-primary tracking-tight">Onboard Session Log-in</h2>
            <p className="text-xs text-text-secondary mt-1">
              Select a preconfigured demo account or enter a custom guest alias to log in.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-400">
              <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="leading-snug">{error}</p>
            </div>
          )}

          {/* Quick Demo Credentials Selection */}
          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <HelpCircle className="h-3 w-3 text-accent" />
              Instant Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => triggerQuickDemo("admin", "password123")}
                disabled={loading}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-border bg-surface-overlay/25 hover:bg-accent/10 hover:border-accent/40 text-center transition-all cursor-pointer group"
              >
                <span className="text-[10px] font-bold text-accent group-hover:text-accent-hover">Host Demo (Admin)</span>
                <span className="text-[8px] text-text-muted mt-0.5 font-mono">admin / password123</span>
              </button>
              <button
                type="button"
                onClick={() => triggerQuickDemo("demo", "password123")}
                disabled={loading}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-border bg-surface-overlay/25 hover:bg-accent/10 hover:border-accent/40 text-center transition-all cursor-pointer group"
              >
                <span className="text-[10px] font-bold text-accent group-hover:text-accent-hover">Bidder Demo (User)</span>
                <span className="text-[8px] text-text-muted mt-0.5 font-mono">demo / password123</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border/40"></div>
            <span className="flex-shrink mx-4 text-[9px] text-text-muted uppercase tracking-widest">Or Custom Guest Login</span>
            <div className="flex-grow border-t border-border/40"></div>
          </div>

          {/* Guest Log-in Form */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="auth-username"
                className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1"
              >
                <User className="h-3 w-3 text-text-muted" />
                Username
              </label>
              <input
                id="auth-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. GuestBidder"
                disabled={loading}
                className="w-full bg-surface-overlay border border-border focus:border-accent/50 focus:ring-1 focus:ring-accent/20 rounded-lg px-4 py-2 text-xs text-text-primary placeholder:text-text-muted transition-all outline-none"
              />
            </div>

            {/* Password input shown only if they trigger demo username or want to verify */}
            {["admin", "demo"].includes(username.toLowerCase().trim()) && (
              <div className="space-y-1.5 animate-fade-in">
                <label
                  htmlFor="auth-password"
                  className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1"
                >
                  <Key className="h-3 w-3 text-text-muted" />
                  Password
                </label>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                  disabled={loading}
                  className="w-full bg-surface-overlay border border-border focus:border-accent/50 focus:ring-1 focus:ring-accent/20 rounded-lg px-4 py-2 text-xs text-text-primary placeholder:text-text-muted transition-all outline-none"
                />
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2"
            variant="primary"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Authenticating..." : "Log In"}
          </Button>
        </form>
      </div>
    </section>
  );
}
