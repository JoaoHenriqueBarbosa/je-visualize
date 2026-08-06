import { Route, Routes } from "react-router-dom";
import SiteHome from "./pages/SiteHome";
import CollectionPage from "./pages/CollectionPage";
import FlowPage from "./pages/FlowPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SiteHome />} />
      <Route path="/:collection" element={<CollectionPage />} />
      <Route path="/:collection/:slug" element={<FlowPage />} />
    </Routes>
  );
}
