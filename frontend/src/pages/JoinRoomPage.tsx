import { BackButton } from "../components/ui/BackButton";
import { PageContainer } from "../components/ui/PageContainer";
import { PageHeader } from "../components/ui/PageHeader";

export function JoinRoomPage() {
  return (
    <PageContainer className="px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader
        title="Join Existing Room"
        description="Enter a room code and username to join an auction as a participant. Form and logic coming in the next milestone."
      >
        <BackButton />
      </PageHeader>
    </PageContainer>
  );
}
