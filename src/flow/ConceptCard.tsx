/**
 * O cartão de conceito, sem nada de React Flow.
 *
 * Existe separado do nó do grafo porque a passada de medição precisa
 * renderizá-lo fora de qualquer canvas. O que se mede tem que ser
 * exatamente o que se vê — então é o mesmo componente nos dois lugares.
 */

import type { NodeSpec } from "./types";

export default function ConceptCard({ node }: { node: NodeSpec }) {
  const accent = node.accent ?? "#c9c2b2";
  const compact = node.variant === "compact";

  return (
    <div
      className={`concept ${compact ? "compact" : "full"} ${node.round ? "round" : ""}`}
      style={{ borderColor: accent }}
    >
      {node.devanagari && (
        <div className="concept-deva" style={{ color: accent }}>
          {node.devanagari}
        </div>
      )}
      <div className="concept-iast">{node.iast}</div>
      {node.gloss && <div className="concept-gloss">{node.gloss}</div>}
      {node.detail && <div className="concept-detail">{node.detail}</div>}
    </div>
  );
}
