import { useParams } from "react-router-dom";

export function AuctionPage() {
  const { code } = useParams<{ code: string }>();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Live Auction</h1>
      <p className="text-text-secondary">
        Room code: <span className="font-mono text-text-primary">{code}</span>
      </p>
      <p className="text-text-secondary">
        Placeholder auction page. Live bidding and countdown timer will appear
        here in later milestones.
      </p>
    </section>
  );
}
