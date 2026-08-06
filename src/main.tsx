/**
 * Bootstrap. O único detalhe não-óbvio: StrictMode monta efeitos duas vezes
 * em dev, e o Measurer aguenta isso porque o efeito de medição é idempotente
 * (mede, seta estado, o stage desmonta). Se um dia a medição ganhar efeitos
 * colaterais, é aqui que o dobro de execução vai aparecer primeiro.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
