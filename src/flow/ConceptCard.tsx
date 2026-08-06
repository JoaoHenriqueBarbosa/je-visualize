/**
 * O cartão de conceito, sem nada de React Flow.
 *
 * Existe separado do nó do grafo porque a passada de medição precisa
 * renderizá-lo fora de qualquer canvas. O que se mede tem que ser
 * exatamente o que se vê — então é o mesmo componente nos dois lugares.
 */

import type { NodeSpec } from "./types";

export default function ConceptCard({ node }: { node: NodeSpec }) {
  // Accent é DADO do flow, não tema: o mesmo princípio guarda a mesma cor em
  // qualquer diagrama (ver flows/palette.ts). Por isso pode viver inline —
  // ao contrário das cores de tema, que já vazaram uma vez quando moravam
  // em JS. O fallback quase nunca aparece: todo flow declara accents.
  const accent = node.accent ?? "#c9c2b2";
  const compact = node.variant === "compact";

  return (
    <div
      className={`concept ${compact ? "compact" : "full"} ${node.round ? "round" : ""}`}
      style={{ borderColor: accent }}
    >
      {node.script && (
        <div className="concept-script" style={{ color: accent }}>
          {node.script}
        </div>
      )}
      <div className="concept-label">{node.label}</div>
      {node.gloss && <div className="concept-gloss">{node.gloss}</div>}
      {node.detail && <div className="concept-detail">{node.detail}</div>}
    </div>
  );
}
