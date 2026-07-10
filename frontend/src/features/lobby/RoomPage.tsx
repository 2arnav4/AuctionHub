import { useParams } from "react-router-dom";

export function RoomPage() {
  const { code } = useParams<{ code: string }>();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Auction Lobby</h1>
      <p className="text-text-secondary">
        Room code: <span className="font-mono text-text-primary">{code}</span>
      </p>
      <p className="text-text-secondary">
        Placeholder lobby page. Participants will wait here before the auction
        starts.
      </p>
    </section>
  );
}
