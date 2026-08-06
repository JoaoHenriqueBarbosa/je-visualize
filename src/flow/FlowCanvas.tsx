/**
 * Orquestrador das passadas.
 *
 * Enquanto não há medidas, só a camada de medição está montada e o canvas
 * fica vazio. Quando as medidas chegam, o layout roda uma vez e o React Flow
 * recebe posições e dimensões já resolvidas — ele nunca precisa medir nada
 * por conta própria, nem mover nada depois.
 */

import { useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { layout } from "./layout";
import { nodeTypes } from "./nodes";
import { useMeasurements } from "./Measurer";
import type { EdgeKind, FlowSpec } from "./types";
import "./flow.css";

const DEFAULT_ACCENT = "#9b9484";

const strokeFor = (kind: EdgeKind) => {
  switch (kind) {
    case "feedback":
      return { strokeDasharray: "5 4", strokeWidth: 1.4 };
    case "illumine":
      return { strokeDasharray: "2 6", strokeWidth: 1.2 };
    case "aside":
      return { strokeDasharray: "0", strokeWidth: 1.4 };
    default:
      return { strokeDasharray: "0", strokeWidth: 1.7 };
  }
};

export default function FlowCanvas({ spec }: { spec: FlowSpec }) {
  const { measurements, stage } = useMeasurements(spec);

  const graph = useMemo(() => {
    if (!measurements) return null;
    const result = layout({ spec, ...measurements });

    const nodes: Node[] = [];

    // Molduras primeiro e com zIndex negativo: são fundo, não conteúdo.
    for (const g of spec.groups ?? []) {
      const r = result.groups[g.id];
      if (!r) continue;
      nodes.push({
        id: `group:${g.id}`,
        type: "group",
        position: { x: r.x, y: r.y },
        data: { label: g.label, sub: g.sub },
        style: { width: r.w, height: r.h },
        width: r.w,
        height: r.h,
        draggable: false,
        selectable: false,
        zIndex: -1,
      });
    }

    for (const n of spec.nodes) {
      const r = result.nodes[n.id];
      if (!r) continue;
      nodes.push({
        id: n.id,
        type: "concept",
        position: { x: r.x, y: r.y },
        data: { node: n },
        width: r.w,
        height: r.h,
        draggable: false,
      });
    }

    const edges: Edge[] = result.edges.map(({ spec: e, fromSide, toSide }) => {
      const kind = (e.kind ?? "flow") as EdgeKind;
      const accent = e.accent ?? DEFAULT_ACCENT;
      const stroke = strokeFor(kind);

      return {
        id: `${e.from}->${e.to}`,
        source: e.from,
        target: e.to,
        sourceHandle: `s-${fromSide}`,
        targetHandle: `t-${toSide}`,
        type: "smoothstep",
        pathOptions: { borderRadius: 14 },
        label: e.label,
        animated: kind === "feedback",
        style: { stroke: accent, ...stroke },
        labelStyle: {
          fill: "#b5ae9f",
          fontSize: 11.5,
          fontStyle: "italic",
        },
        labelBgStyle: { fill: "#100f0d" },
        labelBgPadding: [7, 4] as [number, number],
        labelBgBorderRadius: 2,
        markerEnd:
          kind === "illumine"
            ? undefined
            : { type: MarkerType.ArrowClosed, color: accent, width: 15, height: 15 },
      };
    });

    // O script de auditoria precisa saber quem pertence a qual moldura para
    // distinguir "contém o membro" de "invade o estranho".
    (window as unknown as { __flowMembership?: Record<string, string[]> })
      .__flowMembership = Object.fromEntries(
      (spec.groups ?? []).map((g) => [
        g.id,
        spec.nodes.filter((n) => n.group === g.id).map((n) => n.id),
      ])
    );

    return { nodes, edges };
  }, [spec, measurements]);

  return (
    <div className="flow-canvas">
      {stage}
      {graph && (
        <ReactFlow
          key={spec.slug}
          nodes={graph.nodes}
          edges={graph.edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.08 }}
          minZoom={0.15}
          maxZoom={1.8}
          nodesDraggable={false}
          nodesConnectable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={28}
            size={1}
            color="#282621"
          />
          <Controls showInteractive={false} position="bottom-right" />
        </ReactFlow>
      )}
    </div>
  );
}
