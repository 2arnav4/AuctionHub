import { useState } from "react";
import { LogIn, ShieldAlert, User, HelpCircle, UserPlus, Lock } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useSessionStore } from "../../stores/useSessionStore";
import { login, register } from "../../services/api";
import { getErrorMessage } from "../../utils/error";

export function AuthPortal() {
  const setAuthUser = useSessionStore((state) => state.setAuthUser);

  const [activeTab, setActiveTab] = useState<"guest" | "signin" | "signup">("guest");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent | null, customUser?: string, customPass?: string) => {
    if (e) e.preventDefault();

    const targetUser = customUser ?? username;
    const targetPass = customPass ?? password;

    if (!targetUser.trim()) {
      setError("Please specify a username.");
      return;
    }

    if (!customUser && activeTab !== "guest" && !targetPass) {
      setError("Please specify a password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let data;
      if (!customUser && activeTab === "signup") {
        data = await register(targetUser.trim(), targetPass);
      } else {
        data = await login(targetUser.trim(), targetPass ? targetPass : undefined);
      }
      setAuthUser(data);
    } catch (err: unknown) {
      console.error("Authentication failed:", err);
      setError(getErrorMessage(err, "Authentication failed."));
    } finally {
      setLoading(false);
    }
  };

  const triggerQuickDemo = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    void handleLoginSubmit(null, user, pass);
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
            <div className="grid grid-cols-1">
              <button
                type="button"
                onClick={() => triggerQuickDemo("demo", "password123")}
                disabled={loading}
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-border bg-surface-overlay/25 hover:bg-accent/10 hover:border-accent/40 text-center transition-all cursor-pointer group"
              >
                <span className="text-xs font-bold text-accent group-hover:text-accent-hover">Use Demo Account</span>
                <span className="text-[10px] text-text-muted mt-0.5 font-mono">Username: demo / Password: password123</span>
              </button>
            </div>
          </div>

          {/* Selection Tabs */}
          <div className="flex border-b border-border/40">
            <button
              type="button"
              onClick={() => {
                setActiveTab("guest");
                setError(null);
              }}
              disabled={loading}
              className={`flex-1 pb-2.5 text-[11px] font-semibold uppercase tracking-wider text-center transition-all border-b-2 cursor-pointer ${
                activeTab === "guest"
                  ? "border-accent text-accent"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              }`}
            >
              Guest Access
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("signin");
                setError(null);
              }}
              disabled={loading}
              className={`flex-1 pb-2.5 text-[11px] font-semibold uppercase tracking-wider text-center transition-all border-b-2 cursor-pointer ${
                activeTab === "signin"
                  ? "border-accent text-accent"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("signup");
                setError(null);
              }}
              disabled={loading}
              className={`flex-1 pb-2.5 text-[11px] font-semibold uppercase tracking-wider text-center transition-all border-b-2 cursor-pointer ${
                activeTab === "signup"
                  ? "border-accent text-accent"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Input Form */}
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
                placeholder={activeTab === "guest" ? "e.g. GuestBidder" : "e.g. Alice"}
                disabled={loading}
                className="w-full bg-surface-overlay border border-border focus:border-accent/50 focus:ring-1 focus:ring-accent/20 rounded-lg px-4 py-2 text-xs text-text-primary placeholder:text-text-muted transition-all outline-none"
              />
            </div>

            {/* Password input shown only for Sign In, Sign Up, or when typing reserved usernames */}
            {(activeTab !== "guest" || ["admin", "demo"].includes(username.toLowerCase().trim())) && (
              <div className="space-y-1.5 animate-fade-in">
                <label
                  htmlFor="auth-password"
                  className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1"
                >
                  <Lock className="h-3 w-3 text-text-muted" />
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
            {activeTab === "signup" ? (
              <>
                <UserPlus className="h-4 w-4" />
                {loading ? "Registering..." : "Sign Up"}
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                {loading ? "Authenticating..." : activeTab === "guest" ? "Log In as Guest" : "Sign In"}
              </>
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}
