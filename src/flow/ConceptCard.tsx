/**
 * O cartão de conceito, sem nada de React Flow.
 *
 * Existe separado do nó do grafo porque a passada de medição precisa
 * renderizá-lo fora de qualquer canvas. O que se mede tem que ser
 * exatamente o que se vê — então é o mesmo componente nos dois lugares.
 *
 * Os estados de simulação (valor, aceso, ativo, esmaecido) entram como
 * classes e como o badge de valor. O badge é absoluto, ancorado na borda
 * de cima: não participa da caixa, então ligar a simulação nunca muda a
 * medida — e a medição continua podendo ignorar que a simulação existe.
 */

import type { NodeSpec, SimValue } from "./types";

export interface CardState {
  /** Valor corrente do nó, se a simulação tem um para ele. */
  value?: SimValue;
  /** `activeWhen` verdadeiro agora — a linha viva da tabela. */
  active?: boolean;
  /** Fora do fecho do modo foco. */
  dimmed?: boolean;
}

export default function ConceptCard({
  node,
  state,
}: {
  node: NodeSpec;
  state?: CardState;
}) {
  // Accent é DADO do flow, não tema: o mesmo princípio guarda a mesma cor em
  // qualquer diagrama (ver flows/palette.ts). Por isso pode viver inline —
  // ao contrário das cores de tema, que já vazaram uma vez quando moravam
  // em JS. O fallback quase nunca aparece: todo flow declara accents.
  // A custom property --accent repassa a mesma cor ao CSS de estado
  // (brilho de "aceso", borda do badge) sem que nenhum tema a conheça.
  const accent = node.accent ?? "#c9c2b2";
  const compact = node.variant === "compact";

  const classes = [
    "concept",
    compact ? "compact" : "full",
    node.round ? "round" : "",
    node.input ? "is-input" : "",
    state?.value !== undefined && state.value ? "is-on" : "",
    state?.active ? "is-active" : "",
    state?.dimmed ? "dimmed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      style={{ borderColor: accent, "--accent": accent } as React.CSSProperties}
      role={node.input ? "switch" : undefined}
      aria-checked={node.input ? !!state?.value : undefined}
    >
      {state?.value !== undefined && (
        <div className="concept-value">{String(state.value)}</div>
      )}
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
