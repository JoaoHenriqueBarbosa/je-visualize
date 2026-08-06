/**
 * Passada de medição.
 *
 * Renderiza cada nó, cada rótulo de aresta e cada legenda de grupo com
 * exatamente o CSS que eles terão em cena, só que fora da tela, e lê as
 * caixas do DOM. É por isso que o layout não precisa adivinhar largura de
 * texto: ele recebe a medida real, com a fonte real já carregada.
 */

import { useEffect, useRef, useState } from "react";
import type { FlowSpec, Size } from "./types";
import { edgeKey } from "./types";
import ConceptCard from "./ConceptCard";

export interface Measurements {
  nodeSizes: Record<string, Size>;
  edgeLabelSizes: Record<string, Size>;
  groupLegendSizes: Record<string, Size>;
}

const box = (el: HTMLElement | null): Size =>
  el ? { w: Math.ceil(el.offsetWidth), h: Math.ceil(el.offsetHeight) } : { w: 0, h: 0 };

export function useMeasurements(spec: FlowSpec) {
  const [result, setResult] = useState<Measurements | null>(null);
  const host = useRef<HTMLDivElement>(null);

  // Zera ao trocar de flow, senão o segundo flow herda as medidas do primeiro.
  useEffect(() => setResult(null), [spec.slug]);

  useEffect(() => {
    if (result) return;
    let cancelled = false;

    const read = () => {
      const root = host.current;
      if (!root || cancelled) return;

      const nodeSizes: Record<string, Size> = {};
      const edgeLabelSizes: Record<string, Size> = {};
      const groupLegendSizes: Record<string, Size> = {};

      for (const n of spec.nodes) {
        nodeSizes[n.id] = box(
          root.querySelector<HTMLElement>(`[data-measure-node="${n.id}"]`)
        );
      }
      for (const e of spec.edges) {
        if (!e.label) continue;
        const key = edgeKey(e);
        edgeLabelSizes[key] = box(
          root.querySelector<HTMLElement>(`[data-measure-edge="${CSS.escape(key)}"]`)
        );
      }
      for (const g of spec.groups ?? []) {
        groupLegendSizes[g.id] = box(
          root.querySelector<HTMLElement>(`[data-measure-group="${g.id}"]`)
        );
      }

      setResult({ nodeSizes, edgeLabelSizes, groupLegendSizes });
    };

    // Fontes serifadas e devanāgarī mudam a métrica; medir antes do load
    // devolve números de fallback e o layout sai apertado.
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.ready) fonts.ready.then(() => requestAnimationFrame(read));
    else requestAnimationFrame(read);

    return () => {
      cancelled = true;
    };
  }, [spec, result]);

  const stage = result ? null : (
    <div ref={host} className="measure-stage" aria-hidden>
      {spec.nodes.map((n) => (
        <div key={n.id} data-measure-node={n.id} className="measure-item">
          <ConceptCard node={n} />
        </div>
      ))}
      {spec.edges
        .filter((e) => e.label)
        .map((e) => (
          <div
            key={edgeKey(e)}
            data-measure-edge={edgeKey(e)}
            className="measure-item edge-label"
          >
            {e.label}
          </div>
        ))}
      {(spec.groups ?? []).map((g) => (
        <div
          key={g.id}
          data-measure-group={g.id}
          className="measure-item group-legend"
        >
          <span className="group-legend-name">{g.label}</span>
          {g.sub && <span className="group-legend-sub">{g.sub}</span>}
        </div>
      ))}
    </div>
  );

  return { measurements: result, stage };
}
