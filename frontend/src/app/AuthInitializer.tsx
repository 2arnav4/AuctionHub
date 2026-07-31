import { useCallback, useEffect, useState } from "react";
import { ApiUnavailableError, checkAuth } from "../services/api";
import { useSessionStore } from "../stores/useSessionStore";
import { Button } from "../components/ui/Button";

interface Props {
  children: React.ReactNode;
}

type InitStatus = "loading" | "ready" | "unavailable";

// How long to wait before telling the user a slow start is expected rather than broken.
const SLOW_START_NOTICE_MS = 4_000;

export function AuthInitializer({ children }: Props) {
  const setAuthUser = useSessionStore((state) => state.setAuthUser);
  const [status, setStatus] = useState<InitStatus>("loading");
  const [isSlow, setIsSlow] = useState(false);

  const initialise = useCallback(async () => {
    setStatus("loading");
    setIsSlow(false);

    try {
      const data = await checkAuth();
      setAuthUser(data.user ?? null);
      setStatus("ready");
    } catch (error) {
      // An unreachable backend is not the same as a signed-out user: rendering the
      // app would leave every subsequent request failing with no explanation.
      if (error instanceof ApiUnavailableError) {
        setStatus("unavailable");
        return;
      }

      setAuthUser(null);
      setStatus("ready");
    }
  }, [setAuthUser]);

  useEffect(() => {
    void initialise();
  }, [initialise]);

  useEffect(() => {
    if (status !== "loading") return;

    const timer = setTimeout(() => setIsSlow(true), SLOW_START_NOTICE_MS);
    return () => clearTimeout(timer);
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-black px-6 text-center text-white">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white"
          aria-hidden="true"
        />
        <p className="text-sm text-white/70">Loading your session</p>
        {isSlow && (
          <p className="max-w-sm text-xs text-white/40">
            The server sleeps when idle on the free tier, so the first request can
            take up to a minute to wake it.
          </p>
        )}
      </div>
    );
  }

  if (status === "unavailable") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
        <h1 className="text-lg font-semibold">Can&apos;t reach the server</h1>
        <p className="max-w-sm text-sm text-white/60">
          The auction service is not responding. It may still be starting up, or it
          may be temporarily down.
        </p>
        <Button onClick={() => void initialise()}>Try again</Button>
      </div>
    );
  }

  return <>{children}</>;
}
