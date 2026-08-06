import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Sem nada além do plugin do React de propósito. O projeto não tem alias,
 * não tem proxy, não tem env — a complexidade mora no motor de layout, não
 * no build. O preview (porta 4173) é o que a auditoria ataca; se a porta
 * mudar aqui, mudar também BASE em scripts/audit.mjs.
 */
export default defineConfig({
  plugins: [react()],
});
