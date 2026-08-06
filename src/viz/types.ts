/**
 * O contrato do nível acima do flow: uma visualização de qualquer tipo.
 *
 * `VizSpec` é uma união discriminada por `kind`. O flow é o tipo fundador e
 * o default — `kind` ausente significa `"flow"`, e é por isso que nenhum
 * spec existente mudou quando esta união nasceu. Cada tipo novo entra aqui
 * quando é construído de verdade, junto com seu renderizador e seu conteúdo:
 * a união não lista intenções, lista o que existe.
 *
 * O que todo tipo compartilha (slug, título, subtítulo, blurb, footer) já
 * está em cada spec; a página (`VizPage`) só depende disso e do `kind` para
 * despachar o corpo. Auditoria e rotas não sabem que tipos existem.
 */

import type { FlowSpec, Side } from "../flow/types";

/**
 * Um estado do autômato. Deliberadamente um subconjunto do NodeSpec: sem
 * input/compute (quem muda estado é o evento, não o clique no cartão) e com
 * `rank`/`column` OBRIGATÓRIOS na prática — transições não avançam camada
 * (ciclo é a norma numa máquina), então não há aresta de fluxo para derivar
 * topologia e o autor precisa declará-la.
 */
export interface MachineStateSpec {
  id: string;
  script?: string;
  label: string;
  gloss?: string;
  detail?: string;
  accent?: string;
  variant?: "full" | "compact";
  /** Estados são redondos por default — o tema decide o que isso significa. */
  round?: boolean;
  column?: number;
  rank?: number;
  /** O estado em que a máquina acorda. Sem nenhum, o primeiro da lista. */
  initial?: boolean;
}

export interface MachineEventSpec {
  id: string;
  /** Rótulo do botão. Default: o próprio id. */
  label?: string;
  accent?: string;
}

export interface MachineTransitionSpec {
  from: string;
  to: string;
  /** O evento que dispara. Transição é sempre resposta, nunca espontânea. */
  event: string;
  /** Rótulo da aresta. Default: o rótulo do evento. */
  label?: string;
  accent?: string;
  fromSide?: Side;
  toSide?: Side;
}

/**
 * Máquina de estados: estados como cartões, transições como arestas,
 * eventos como botões. O estado corrente fica aceso; disparar um evento
 * segue a transição aplicável (botão desabilitado quando não há nenhuma).
 */
export interface MachineSpec {
  kind: "machine";
  slug: string;
  title: string;
  script?: string;
  subtitle: string;
  blurb: string;
  footer?: string[];
  states: MachineStateSpec[];
  events: MachineEventSpec[];
  transitions: MachineTransitionSpec[];
}

/**
 * Dois flows lado a lado com os inputs COMPARTILHADOS por id: alternar A
 * num lado alterna nos dois, e a diferença entre os specs vira a única
 * coisa que muda na tela. É o argumento "é o mesmo desenho" tornado
 * literal — nasceu para AND ‖ OR.
 */
export interface CompareSpec {
  kind: "compare";
  slug: string;
  title: string;
  script?: string;
  subtitle: string;
  blurb: string;
  footer?: string[];
  /** Os lados, na ordem de exibição. Inputs de mesmo id são um só controle. */
  sides: FlowSpec[];
}

export type VizSpec = FlowSpec | CompareSpec | MachineSpec;

export type VizKind = NonNullable<VizSpec["kind"]>;

/** O discriminante, com o default do fundador aplicado. */
export const vizKind = (v: VizSpec): VizKind => v.kind ?? "flow";

/**
 * A linha de meta do card na página da coleção, por tipo — "9 princípios ·
 * 4 relações" é vocabulário de flow e não faz sentido num kanban.
 */
export const vizMeta = (v: VizSpec): string => {
  switch (vizKind(v)) {
    case "flow": {
      const f = v as FlowSpec;
      return `${f.nodes.length} princípios · ${f.edges.length} relações`;
    }
    case "compare": {
      const c = v as CompareSpec;
      return c.sides.map((s) => s.title).join(" ‖ ");
    }
    case "machine": {
      const m = v as MachineSpec;
      return `${m.states.length} estados · ${m.transitions.length} transições`;
    }
  }
};
