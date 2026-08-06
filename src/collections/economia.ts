/**
 * A terceira coleção — e a primeira de tema claro: o livro-razão. A regra
 * de distribuição pedia casa nova para assunto novo, e economia política
 * não é sāṃkhya nem circuito.
 *
 * Abre pela teoria do valor porque é onde O Capital abre: a mercadoria como
 * célula. As próximas visualizações do assunto (circuito do capital como
 * ciclo, composição orgânica como sankey, escolas como registros...) entram
 * no array quando forem pedidas.
 */

import type { CollectionSpec } from "./types";
import { teoriaDoValor } from "../flows/valor";

export const economia: CollectionSpec = {
  slug: "economia",
  title: "economia",
  blurb:
    "A crítica da economia política em diagramas: o valor como relação social, contado em horas.",
  subtitle: "a crítica da economia política, começando pela célula",
  lede:
    "Marx abre O Capital pela mercadoria porque nela já está, dobrado, tudo o mais — o valor, o dinheiro, o capital, o acréscimo. A primeira visualização segue esse desdobramento até a taxa de mais-valia, e conduz de verdade: as jornadas são clicáveis.",
  footer:
    "Toda grandeza aqui é tempo de trabalho: o dinheiro só traduz.",
  theme: "theme-economia",
  vizes: [teoriaDoValor],
};
