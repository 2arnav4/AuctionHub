import { ActionCards } from "../features/home/ActionCards";
import { HeroSection } from "../features/home/HeroSection";

export function HomePage() {
  return (
    <div className="relative">
      <HeroSection />
      <ActionCards />
    </div>
  );
}
