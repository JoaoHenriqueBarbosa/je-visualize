/**
 * O explodido: uma figura em grade CSS com cartões-legenda ancorados por
 * camada nos dois lados. O spec declara linhas e colunas da grade — índices,
 * nunca pixel; a altura de cada camada é variável de tema/globals e a
 * largura vem do container. O casamento visual entre camada e legenda é a
 * cor: o filete do cartão é o accent da célula que ele explica.
 */

import { useEffect } from "react";
import "./geo.css";
import type { ExplodedSpec } from "./types";

export default function ExplodedCanvas({ spec }: { spec: ExplodedSpec }) {
  useEffect(() => {
    const w = window as unknown as {
      __vizRegistry?: Record<string, Record<string, unknown>>;
    };
    const reg = (w.__vizRegistry ??= {});
    reg[spec.slug] = {
      ...(reg[spec.slug] ?? {}),
      exploded: {
        cells: spec.cells.length,
        callouts: spec.callouts.length,
      },
    };
    return () => {
      delete reg[spec.slug];
    };
  }, [spec]);

  const rows = Math.max(...spec.cells.map((c) => c.row));
  const cellOf = (id: string) => spec.cells.find((c) => c.id === id);

  const side = (which: "l" | "r") =>
    spec.callouts
      .filter((c) => c.side === which)
      .sort(
        (a, b) =>
          (cellOf(a.target)?.row ?? 0) - (cellOf(b.target)?.row ?? 0)
      );

  const callout = (c: ExplodedSpec["callouts"][number]) => {
    const cell = cellOf(c.target);
    return (
      <div
        key={c.target + c.label}
        data-callout={c.target}
        className="exploded-callout"
        style={
          cell?.accent ? { borderLeftColor: cell.accent } : undefined
        }
      >
        <div className="exploded-callout-label">{c.label}</div>
        {c.gloss && <div className="exploded-callout-gloss">{c.gloss}</div>}
        {c.detail && (
          <div className="exploded-callout-detail">{c.detail}</div>
        )}
      </div>
    );
  };

  return (
    <div className="exploded" data-viz={spec.slug} data-viz-kind="exploded">
      <div className="exploded-stage">
        <div className="exploded-side">{side("l").map(callout)}</div>

        <div
          className="exploded-figure"
          style={{
            gridTemplateColumns: `repeat(${spec.cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, var(--exploded-row-h, 64px))`,
          }}
        >
          {spec.cells.map((cell) => (
            <div
              key={cell.id}
              data-cell={cell.id}
              className="exploded-cell"
              style={{
                gridRow: cell.row,
                gridColumn: `${cell.colStart} / ${cell.colEnd}`,
                borderColor: cell.accent,
              }}
            >
              {cell.script && (
                <span
                  className="exploded-cell-script"
                  style={cell.accent ? { color: cell.accent } : undefined}
                >
                  {cell.script}
                </span>
              )}
              <span className="exploded-cell-label">{cell.label}</span>
            </div>
          ))}
        </div>

        <div className="exploded-side">{side("r").map(callout)}</div>
      </div>
    </div>
  );
}
