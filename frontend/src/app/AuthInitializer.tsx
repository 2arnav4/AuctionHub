import { useEffect, useState } from "react";
import { checkAuth } from "../services/api";
import { useSessionStore } from "../stores/useSessionStore";

interface Props {
  children: React.ReactNode;
}

export function AuthInitializer({ children }: Props) {
  const setAuthUser = useSessionStore((state) => state.setAuthUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const data = await checkAuth();

        if (data.user) {
          setAuthUser(data.user);
        } else {
          setAuthUser(null);
        }
      } catch {
        setAuthUser(null);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [setAuthUser]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
