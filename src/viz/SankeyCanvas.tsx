/**
 * Sankey — fluxo com quantidade: a espessura é o valor. Recharts por baixo,
 * com a mesma disciplina do ChartCard: container de tamanho fixo por CSS,
 * lido uma vez, width/height numéricos — sem ResponsiveContainer.
 *
 * Cores: nós e elos pelos accents do spec (dado); texto pela variável do
 * tema lida do container, a ponte controlada de sempre.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Sankey, Layer, Rectangle } from "recharts";
import "./geo.css";
import type { SankeySpec } from "./types";

interface NodePayload {
  name: string;
  accent?: string;
  script?: string;
}

export default function SankeyCanvas({ spec }: { spec: SankeySpec }) {
  const host = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [ink, setInk] = useState({ ink: "", dim: "" });

  useLayoutEffect(() => {
    const el = host.current;
    if (!el) return;
    const style = getComputedStyle(el);
    setBox({ w: el.clientWidth, h: el.clientHeight });
    setInk({
      ink: style.getPropertyValue("--ink").trim(),
      dim: style.getPropertyValue("--dim").trim(),
    });
  }, []);

  useEffect(() => {
    const w = window as unknown as {
      __vizRegistry?: Record<string, Record<string, unknown>>;
    };
    const reg = (w.__vizRegistry ??= {});
    reg[spec.slug] = {
      ...(reg[spec.slug] ?? {}),
      sankey: { nodes: spec.nodes.length, links: spec.links.length },
    };
    return () => {
      delete reg[spec.slug];
    };
  }, [spec]);

  const idx = new Map(spec.nodes.map((n, i) => [n.id, i]));
  const data = {
    nodes: spec.nodes.map(
      (n): NodePayload => ({ name: n.label, accent: n.accent, script: n.script })
    ),
    links: spec.links.map((l) => ({
      source: idx.get(l.from) ?? 0,
      target: idx.get(l.to) ?? 0,
      value: l.value,
    })),
  };

  return (
    <div className="sankey" data-viz={spec.slug} data-viz-kind="sankey">
      <div className="sankey-stage" ref={host}>
        {box && (
          <Sankey
            width={box.w}
            height={box.h}
            data={data}
            nodePadding={42}
            margin={{ top: 24, right: 160, bottom: 24, left: 12 }}
            link={({ sourceX, sourceY, sourceControlX, targetX, targetY, targetControlX, linkWidth, payload }) => {
              // Fita preenchida (duas bordas Bézier fechadas), não traço
              // grosso: com valores grandes o stroke curvo se atropela.
              const hw = linkWidth / 2;
              return (
                <path
                  className="sankey-link"
                  d={
                    `M${sourceX},${sourceY - hw}` +
                    ` C${sourceControlX},${sourceY - hw} ${targetControlX},${targetY - hw} ${targetX},${targetY - hw}` +
                    ` L${targetX},${targetY + hw}` +
                    ` C${targetControlX},${targetY + hw} ${sourceControlX},${sourceY + hw} ${sourceX},${sourceY + hw}` +
                    ` Z`
                  }
                  fill={(payload.source as NodePayload).accent ?? "#888"}
                  fillOpacity={0.22}
                  stroke="none"
                />
              );
            }}
            node={({ x, y, width, height, payload }) => {
              const p = payload as NodePayload & { value: number };
              return (
                <Layer>
                  <Rectangle
                    className="sankey-node"
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={p.accent ?? "#888"}
                    fillOpacity={0.9}
                  />
                  <text
                    x={x + width + 8}
                    y={y + height / 2 - 2}
                    fill={ink.ink}
                    className="sankey-node-name"
                    dominantBaseline="middle"
                  >
                    {p.name}
                  </text>
                  <text
                    x={x + width + 8}
                    y={y + height / 2 + 13}
                    fill={ink.dim}
                    className="sankey-node-value"
                    dominantBaseline="middle"
                  >
                    {p.value}
                  </text>
                </Layer>
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
