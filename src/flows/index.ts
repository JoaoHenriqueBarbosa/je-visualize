import type { FlowSpec } from "../flow/types";
import { antahkarana } from "./antahkarana";
import { tattvas } from "./tattvas";
import { guna, pramana, kaivalya } from "./small";

/** Ordem de leitura sugerida: do problema à cosmologia ao detalhe. */
export const flows: FlowSpec[] = [
  kaivalya,
  tattvas,
  guna,
  antahkarana,
  pramana,
];

export const flowBySlug = (slug: string) =>
  flows.find((f) => f.slug === slug);
