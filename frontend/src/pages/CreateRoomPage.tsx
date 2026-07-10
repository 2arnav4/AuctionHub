import { BackButton } from "../components/ui/BackButton";
import { PageContainer } from "../components/ui/PageContainer";
import { PageHeader } from "../components/ui/PageHeader";

export function CreateRoomPage() {
  return (
    <PageContainer className="px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader
        title="Create Auction Room"
        description="Set up your auction room, add items, and share the room code with participants. Form and logic coming in the next milestone."
      >
        <BackButton />
      </PageHeader>
    </PageContainer>
  );
}
