import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { checkAuth } from "../services/api";
import { useSessionStore } from "../stores/useSessionStore";

export function Layout() {
  const setAuthUser = useSessionStore((state) => state.setAuthUser);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user } = await checkAuth();
        setAuthUser(user);
      } catch (err) {
        console.error("Failed to restore auth session:", err);
      }
    };
    fetchUser();
  }, [setAuthUser]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
