/**
 * A segunda coleção — nascida como prova de que a generalização funciona:
 * sem grafia nativa (script ausente), tema oposto ao do sāṃkhya, mesmo
 * motor. O footer registra isso de propósito.
 */

import type { CollectionSpec } from "./types";
import { portaAnd, portaOr } from "../flows/eletronica";

export const eletronica: CollectionSpec = {
  slug: "eletronica",
  title: "eletrônica",
  blurb:
    "As portas lógicas pela topologia do circuito: o que muda entre uma e outra não é a peça, é a forma do caminho.",
  subtitle: "portas lógicas lidas como caminhos de corrente",
  lede:
    "Uma porta não decide nada: ela é um arranjo de chaves onde a corrente ou tem por onde passar ou não tem. Série e paralelo são as duas formas mínimas, e dão as duas portas fundamentais.",
  footer: "Sem grafia nativa: nem todo assunto tem uma, e o tema aguenta.",
  theme: "theme-eletronica",
  flows: [portaAnd, portaOr],
};
