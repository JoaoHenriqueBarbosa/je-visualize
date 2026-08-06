/**
 * A escala: um eixo contínuo onde a posição É o valor. Faixas pintam
 * intervalos, marcas apontam valores exatos — rótulos de saída à esquerda,
 * de entrada à direita, como o autor declarar. Tudo posicionado por
 * porcentagem do domínio; nenhum pixel no spec.
 */

import { useEffect } from "react";
import "./geo.css";
import type { ScaleSpec } from "./types";

const pct = (spec: ScaleSpec, v: number) =>
  ((v - spec.min) / (spec.max - spec.min || 1)) * 100;

export default function ScaleCanvas({ spec }: { spec: ScaleSpec }) {
  useEffect(() => {
    const w = window as unknown as {
      __vizRegistry?: Record<string, Record<string, unknown>>;
    };
    const reg = (w.__vizRegistry ??= {});
    reg[spec.slug] = {
      ...(reg[spec.slug] ?? {}),
      scale: { bands: spec.bands.length, marks: spec.marks?.length ?? 0 },
    };
    return () => {
      delete reg[spec.slug];
    };
  }, [spec]);

  const fmt = (v: number) => `${v}${spec.unit ?? ""}`;

  return (
    <div className="scale" data-viz={spec.slug} data-viz-kind="scale">
      <div className="scale-stage">
        {/* Marcas da esquerda, a régua, marcas da direita. */}
        <div className="scale-col scale-col-l">
          {(spec.marks ?? [])
            .filter((m) => m.side === "l")
            .map((m) => (
              <div
                key={m.label}
                data-mark={m.label}
                className="scale-mark l"
                style={{ bottom: `${pct(spec, m.at)}%` }}
              >
                <span className="scale-mark-text">
                  <span
                    className="scale-mark-name"
                    style={m.accent ? { color: m.accent } : undefined}
                  >
                    {m.label} · {fmt(m.at)}
                  </span>
                  {m.gloss && (
                    <span className="scale-mark-gloss">{m.gloss}</span>
                  )}
                </span>
                <span
                  className="scale-mark-line"
                  style={m.accent ? { background: m.accent } : undefined}
                />
              </div>
            ))}
        </div>

        <div className="scale-ruler">
          {spec.bands.map((b) => (
            <div
              key={b.label}
              data-band={b.label}
              className="scale-band"
              style={{
                bottom: `${pct(spec, b.from)}%`,
                height: `${pct(spec, b.to) - pct(spec, b.from)}%`,
                borderColor: b.accent,
              }}
            >
              <span
                className="scale-band-label"
                style={b.accent ? { color: b.accent } : undefined}
              >
                {b.label}
              </span>
              {b.gloss && <span className="scale-band-gloss">{b.gloss}</span>}
              {b.detail && (
                <span className="scale-band-detail">{b.detail}</span>
              )}
            </div>
          ))}
          <span className="scale-end scale-end-max">{fmt(spec.max)}</span>
          <span className="scale-end scale-end-min">{fmt(spec.min)}</span>
        </div>

        <div className="scale-col scale-col-r">
          {(spec.marks ?? [])
            .filter((m) => m.side !== "l")
            .map((m) => (
              <div
                key={m.label}
                data-mark={m.label}
                className="scale-mark r"
                style={{ bottom: `${pct(spec, m.at)}%` }}
              >
                <span
                  className="scale-mark-line"
                  style={m.accent ? { background: m.accent } : undefined}
                />
                <span className="scale-mark-text">
                  <span
                    className="scale-mark-name"
                    style={m.accent ? { color: m.accent } : undefined}
                  >
                    {m.label} · {fmt(m.at)}
                  </span>
                  {m.gloss && (
                    <span className="scale-mark-gloss">{m.gloss}</span>
                  )}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
