/**
 * Venn aninhado: círculos concêntricos, do conjunto mais interno ao mais
 * externo — cada anel é o que o conjunto de fora ACRESCENTA. Itens do
 * conjunto interno empilham no miolo; itens de anel se distribuem nos dois
 * lados do anel, onde ele é mais largo.
 *
 * SVG puro com classes: traço e texto vêm do CSS do tema; a única cor
 * inline é o accent de cada conjunto — dado, como sempre.
 */

import { useEffect } from "react";
import "./geo.css";
import type { VennSpec } from "./types";

const R_BASE = 120;
const R_STEP = 95;

export default function VennCanvas({ spec }: { spec: VennSpec }) {
  useEffect(() => {
    const w = window as unknown as {
      __vizRegistry?: Record<string, Record<string, unknown>>;
    };
    const reg = (w.__vizRegistry ??= {});
    reg[spec.slug] = {
      ...(reg[spec.slug] ?? {}),
      venn: { sets: spec.sets.length, items: spec.items.length },
    };
    return () => {
      delete reg[spec.slug];
    };
  }, [spec]);

  const n = spec.sets.length;
  const rOf = (i: number) => R_BASE + i * R_STEP;
  const rMax = rOf(n - 1);
  const pad = 70;
  const size = (rMax + pad) * 2;
  const c = rMax + pad;

  return (
    <div className="venn" data-viz={spec.slug} data-viz-kind="venn">
      <svg
        className="venn-svg"
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={spec.title}
      >
        {/* De fora para dentro, para o traço interno ficar por cima. */}
        {[...spec.sets].reverse().map((s, ri) => {
          const i = n - 1 - ri;
          return (
            <g key={s.id}>
              <circle
                className="venn-circle"
                cx={c}
                cy={c}
                r={rOf(i)}
                style={s.accent ? { stroke: s.accent } : undefined}
              />
              <text
                className="venn-set-label"
                x={c}
                y={c - rOf(i) + 26}
                textAnchor="middle"
                style={s.accent ? { fill: s.accent } : undefined}
              >
                {s.label}
              </text>
              {s.note && (
                <text
                  className="venn-set-note"
                  x={c}
                  y={c - rOf(i) + 44}
                  textAnchor="middle"
                >
                  {s.note}
                </text>
              )}
            </g>
          );
        })}

        {spec.sets.map((s, i) => {
          const items = spec.items.filter((it) => it.set === s.id);
          if (!items.length) return null;

          if (i === 0) {
            // Miolo: empilha no centro.
            const lh = 34;
            const y0 = c - ((items.length - 1) * lh) / 2;
            return items.map((it, k) => (
              <g key={it.id} data-venn-item={it.id}>
                {it.script && (
                  <text
                    className="venn-item-script"
                    x={c}
                    y={y0 + k * lh - 8}
                    textAnchor="middle"
                    style={s.accent ? { fill: s.accent } : undefined}
                  >
                    {it.script}
                  </text>
                )}
                <text
                  className="venn-item"
                  x={c}
                  y={y0 + k * lh + 8}
                  textAnchor="middle"
                >
                  {it.label}
                </text>
              </g>
            ));
          }

          // Anel: alterna esquerda/direita na banda mais larga.
          const rMid = (rOf(i - 1) + rOf(i)) / 2;
          return items.map((it, k) => {
            const side = k % 2 === 0 ? 1 : -1;
            const stack = Math.floor(k / 2);
            const x = c + side * rMid;
            const y = c + (stack - (Math.ceil(items.length / 2) - 1) / 2) * 40;
            return (
              <g key={it.id} data-venn-item={it.id}>
                {it.script && (
                  <text
                    className="venn-item-script"
                    x={x}
                    y={y - 8}
                    textAnchor="middle"
                    style={s.accent ? { fill: s.accent } : undefined}
                  >
                    {it.script}
                  </text>
                )}
                <text
                  className="venn-item"
                  x={x}
                  y={y + 8}
                  textAnchor="middle"
                >
                  {it.label}
                </text>
              </g>
            );
          });
        })}
      </svg>
    </div>
  );
}
