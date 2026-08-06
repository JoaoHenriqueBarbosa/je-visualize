/**
 * As três rotas do site, espelhando a hierarquia dos dados:
 *
 *   /                       coleções     (collections/index.ts)
 *   /:collection            diagramas    (CollectionSpec.flows)
 *   /:collection/:slug      um diagrama  (FlowSpec)
 *
 * Não há rota fora dessa hierarquia e não deve haver: a auditoria descobre
 * o site rastreando esses dois níveis de card, e o roteamento SPA da Vercel
 * (vercel.json) reescreve tudo para o index.html — qualquer URL profunda
 * funciona num reload porque o React Router resolve do lado do cliente.
 */

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
