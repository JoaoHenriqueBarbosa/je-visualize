/**
 * Layout polar — o primeiro posicionador não-cartesiano do motor.
 *
 * A mesma disciplina da grade: as medidas chegam do DOM e o raio é DERIVADO
 * delas — cresce até a corda entre vizinhos caber os dois cartões mais a
 * folga. Nada aqui inventa tamanho, e um anel de cartões largos simplesmente
 * sai maior.
 *
 * O nó central (se houver) fica no centro; o anel começa no topo e segue em
 * sentido horário, na ordem do spec — ordem de array é topologia, como
 * sempre.
 */

import type { LayoutInput, LayoutResult } from "../../flow/layout";
import { placeEdges } from "../../flow/layout";
import type { Rect } from "../../flow/types";

/** Folga mínima entre cartões vizinhos do anel. */
const RING_GAP = 56;
/** Folga entre o centro e o anel. */
const CENTER_GAP = 64;
/** Margem do canvas. */
const MARGIN = 48;

export const layoutPolar =
  (centerId?: string) =>
  (input: LayoutInput): LayoutResult => {
    const { spec, nodeSizes } = input;
    const fallback = { w: 250, h: 120 };
    const sizeOf = (id: string) => nodeSizes[id] ?? fallback;

    const ring = spec.nodes.filter((n) => n.id !== centerId);
    const center = spec.nodes.find((n) => n.id === centerId);
    const N = Math.max(ring.length, 1);

    // Corda mínima: os dois maiores meio-diâmetros adjacentes + folga. O
    // diâmetro de um cartão no anel é a diagonal — vale para qualquer ângulo.
    const diag = (id: string) => {
      const s = sizeOf(id);
      return Math.hypot(s.w, s.h);
    };
    let chord = 0;
    for (let i = 0; i < ring.length; i++) {
      const j = (i + 1) % ring.length;
      chord = Math.max(
        chord,
        diag(ring[i].id) / 2 + diag(ring[j].id) / 2 + RING_GAP
      );
    }

    // O raio precisa caber a corda entre vizinhos E o centro com sua folga.
    const fromChord = N > 1 ? chord / (2 * Math.sin(Math.PI / N)) : 0;
    const centerSize = center ? sizeOf(center.id) : { w: 0, h: 0 };
    const fromCenter = center
      ? Math.hypot(centerSize.w, centerSize.h) / 2 +
        Math.max(...ring.map((n) => diag(n.id))) / 2 +
        CENTER_GAP
      : 0;
    const R = Math.max(fromChord, fromCenter, 160);

    const maxHalfW = Math.max(...ring.map((n) => sizeOf(n.id).w / 2));
    const maxHalfH = Math.max(...ring.map((n) => sizeOf(n.id).h / 2));
    const cx = R + maxHalfW + MARGIN;
    const cy = R + maxHalfH + MARGIN;

    const nodes: Record<string, Rect> = {};
    ring.forEach((n, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / N;
      const s = sizeOf(n.id);
      nodes[n.id] = {
        x: Math.round(cx + R * Math.cos(angle) - s.w / 2),
        y: Math.round(cy + R * Math.sin(angle) - s.h / 2),
        w: s.w,
        h: s.h,
      };
    });
    if (center) {
      nodes[center.id] = {
        x: Math.round(cx - centerSize.w / 2),
        y: Math.round(cy - centerSize.h / 2),
        w: centerSize.w,
        h: centerSize.h,
      };
    }

    return {
      nodes,
      groups: {},
      edges: placeEdges(spec, nodes),
      bounds: {
        x: 0,
        y: 0,
        w: Math.round(cx * 2),
        h: Math.round(cy * 2),
      },
    };
  };
