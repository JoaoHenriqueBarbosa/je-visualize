/**
 * Contrato de esquema dos flows.
 *
 * Um flow é declarativo: descreve *o que* se relaciona com o quê, nunca
 * coordenadas. Todo posicionamento é derivado pelo motor em `layout.ts`
 * a partir de medidas reais tiradas do DOM.
 *
 * O único controle espacial exposto ao autor é topológico:
 *   - `column`: em que faixa vertical o nó vive (0 é o eixo principal,
 *     negativos à esquerda, positivos à direita);
 *   - `rank`: fixa a camada horizontal quando não há aresta de fluxo que a
 *     derive (útil para fileiras de irmãos, como os cinco mahābhūtas).
 *
 * Nenhum dos dois é pixel. São índices de grade; o motor decide a métrica.
 */

/** Lado de um nó por onde uma aresta entra ou sai. */
export type Side = "t" | "b" | "l" | "r";

export interface NodeSpec {
  id: string;
  /** Grafia devanāgarī, opcional. */
  devanagari?: string;
  /** Transliteração IAST — é o rótulo principal. */
  iast: string;
  /** Termo técnico ou tradução curta, em itálico sob o nome. */
  gloss?: string;
  /** Parágrafo explicativo. Ausente em nós compactos. */
  detail?: string;
  /** Cor de acento. Cai no default do flow se ausente. */
  accent?: string;
  /** `full` (250px, com detalhe) ou `compact` (160px, só nome e gloss). */
  variant?: "full" | "compact";
  /** Arredondado para o que não é instrumento — puruṣa, ātman. */
  round?: boolean;
  /** Faixa vertical. 0 = eixo principal. */
  column?: number;
  /** Fixa a camada. Sem isso, deriva das arestas de fluxo. */
  rank?: number;
  /** Id do grupo que contém este nó. */
  group?: string;
}

export interface GroupSpec {
  id: string;
  label: string;
  sub?: string;
}

/**
 * `flow`      — avança uma camada; é o que define a ordenação topológica.
 * `aside`     — relação lateral, não avança camada.
 * `feedback`  — retorno; ignorado na ordenação para não criar ciclo.
 * `illumine`  — presença que não é causal (ātman, puruṣa). Traço pontilhado.
 */
export type EdgeKind = "flow" | "aside" | "feedback" | "illumine";

export interface EdgeSpec {
  from: string;
  to: string;
  label?: string;
  kind?: EdgeKind;
  accent?: string;
  /** Força o lado de saída. Sem isso, o motor deriva da geometria final. */
  fromSide?: Side;
  /** Força o lado de entrada. */
  toSide?: Side;
}

export interface FlowSpec {
  slug: string;
  title: string;
  devanagari: string;
  /** Uma linha sob o título, no cabeçalho da página do flow. */
  subtitle: string;
  /** Parágrafo do card na home. */
  blurb: string;
  /** Linhas do rodapé: a primeira em destaque, as demais em nota. */
  footer?: string[];
  groups?: GroupSpec[];
  nodes: NodeSpec[];
  edges: EdgeSpec[];
}

/** Retângulo em coordenadas do canvas. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Size {
  w: number;
  h: number;
}

/** Chave estável de uma aresta, usada para casar medidas de rótulo. */
export const edgeKey = (e: EdgeSpec) => `${e.from}->${e.to}`;
