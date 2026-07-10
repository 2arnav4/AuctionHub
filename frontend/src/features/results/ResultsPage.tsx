import { useParams } from "react-router-dom";

export function ResultsPage() {
  const { code } = useParams<{ code: string }>();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Auction Results</h1>
      <p className="text-text-secondary">
        Room code: <span className="font-mono text-text-primary">{code}</span>
      </p>
      <p className="text-text-secondary">
        Placeholder results page. Final sold and unsold outcomes will be shown
        here after the auction ends.
      </p>
    </section>
  );
}
