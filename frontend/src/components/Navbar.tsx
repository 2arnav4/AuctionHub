import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <header className="border-b border-border bg-surface-raised">
      <nav className="mx-auto flex h-14 max-w-5xl items-center px-4">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-text-primary transition-colors hover:text-accent"
        >
          Mini Realtime Auction Room
        </Link>
      </nav>
    </header>
  );
}
