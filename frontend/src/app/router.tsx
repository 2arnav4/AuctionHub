import { Route, Routes } from "react-router-dom";
import { Layout } from "../components/Layout";
import { AuctionPage } from "../features/auction/AuctionPage";
import { RoomPage } from "../features/lobby/RoomPage";
import { ResultsPage } from "../features/results/ResultsPage";
import { CreateRoomPage } from "../pages/CreateRoomPage";
import { HomePage } from "../pages/HomePage";
import { JoinRoomPage } from "../pages/JoinRoomPage";
import { LobbyPage } from "../pages/LobbyPage";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateRoomPage />} />
        <Route path="/join" element={<JoinRoomPage />} />
        <Route path="/lobby/:code" element={<LobbyPage />} />
        <Route path="/room/:code" element={<RoomPage />} />
        <Route path="/auction/:code" element={<AuctionPage />} />
        <Route path="/results/:code" element={<ResultsPage />} />
      </Route>
    </Routes>
  );
}
