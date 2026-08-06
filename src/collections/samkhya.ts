/**
 * A coleção fundadora. Os textos daqui moravam em JSX na primeira Home;
 * virar dado foi o que permitiu a página de coleção ser genérica.
 */

import type { CollectionSpec } from "./types";
import { antahkarana } from "../flows/antahkarana";
import { tattvas } from "../flows/tattvas";
import { guna, pramana, kaivalya } from "../flows/small";
import { tattvabhyasa } from "../flows/viveka";

export const samkhya: CollectionSpec = {
  slug: "samkhya",
  title: "sāṃkhya",
  script: "सांख्य",
  blurb:
    "O mais antigo dos seis darśanas, e o único que resolve o problema contando. Vinte e cinco princípios, três guṇas, três meios de conhecer.",
  subtitle:
    "O mais antigo dos seis darśanas, e o único que resolve o problema contando.",
  lede:
    "Vinte e cinco princípios, três guṇas, três meios de conhecer. Nada de criação a partir do nada: o efeito já estava na causa, e o que se chama de manifestar é só o que estava implícito ficando explícito.",
  theme: "theme-samkhya",
  footer:
    "Ordem de leitura sugerida: do problema à cosmologia ao detalhe — e a dinâmica por último.",
  /** Do problema à cosmologia ao detalhe; a dinâmica fecha. */
  vizes: [kaivalya, tattvas, guna, antahkarana, pramana, tattvabhyasa],
};
