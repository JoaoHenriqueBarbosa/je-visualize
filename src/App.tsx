import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import FlowPage from "./pages/FlowPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:slug" element={<FlowPage />} />
    </Routes>
  );
}
