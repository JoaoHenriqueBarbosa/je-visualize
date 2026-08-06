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

/** Valor que circula na simulação: nível lógico, número, símbolo. */
export type SimValue = number | string | boolean;

/** Um sinal observado por um cartão-instrumento. */
export interface ChartWatch {
  id: string;
  /** Rótulo da faixa. Default: o próprio id. */
  label?: string;
}

export interface ChartSpec {
  /** Por ora só onda digital (faixas step). Outros tipos entram por fase. */
  type: "wave";
  watch: ChartWatch[];
  /** Varredura estática: cada item é um estado de entradas a avaliar. */
  sweep?: Record<string, SimValue>[];
}

export interface NodeSpec {
  id: string;
  /** Grafia nativa ou símbolo, opcional: devanāgarī, glifo, notação. */
  script?: string;
  /** Nome do nó — é o rótulo principal. */
  label: string;
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

  /*
   * Campos de simulação. A presença de qualquer um deles num nó liga a
   * simulação do flow inteiro; a ausência de todos mantém o flow estático,
   * e é por isso que nenhum spec antigo mudou quando a camada entrou.
   * O contrato continua declarativo — as funções são dado do assunto
   * (specs são módulos TS), nunca posição, nunca pixel.
   */

  /** Torna o cartão um controle: o clique alterna pelos valores do ciclo. */
  input?: { initial: SimValue; cycle?: SimValue[] };
  /**
   * Torna o cartão um instrumento: desenha os sinais observados. Sem
   * `sweep`, a fonte é o histórico da simulação (o que o leitor alternou);
   * com `sweep`, é a varredura estática — cada entrada avaliada pelo spec.
   * A altura do chart é `--card-chart-h` (globals.css): entrada do motor,
   * medida como tudo o mais.
   */
  chart?: ChartSpec;
  /**
   * Deriva o valor deste nó dos valores correntes, por id. Avaliado por
   * relaxamento, então pode ler qualquer nó — inclusive num ciclo (latch),
   * que estabiliza ou para no limite de passadas.
   */
  compute?: (v: Record<string, SimValue>) => SimValue;
  /** Acende o cartão enquanto a condição vale — a linha viva da tabela. */
  activeWhen?: (v: Record<string, SimValue>) => boolean;
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
  /**
   * Discriminante da união VizSpec (src/viz/types.ts). Opcional e default
   * porque o flow é o tipo fundador: todo spec sem `kind` é um flow, e os
   * specs existentes não precisaram mudar quando a união nasceu.
   */
  kind?: "flow";
  slug: string;
  title: string;
  script?: string;
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
