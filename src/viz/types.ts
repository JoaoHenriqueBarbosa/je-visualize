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

import type { FlowSpec } from "../flow/types";

export type VizSpec = FlowSpec;

export type VizKind = NonNullable<VizSpec["kind"]>;

/** O discriminante, com o default do fundador aplicado. */
export const vizKind = (v: VizSpec): VizKind => v.kind ?? "flow";

/**
 * A linha de meta do card na página da coleção, por tipo — "9 princípios ·
 * 4 relações" é vocabulário de flow e não faz sentido num kanban.
 */
export const vizMeta = (v: VizSpec): string => {
  switch (vizKind(v)) {
    case "flow":
      return `${v.nodes.length} princípios · ${v.edges.length} relações`;
  }
};
