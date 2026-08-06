/**
 * Orquestrador das passadas.
 *
 * Enquanto não há medidas, só a camada de medição está montada e o canvas
 * fica vazio. Quando as medidas chegam, o layout roda uma vez e o React Flow
 * recebe posições e dimensões já resolvidas — ele nunca precisa medir nada
 * por conta própria, nem mover nada depois.
 *
 * A simulação e o modo foco entram DEPOIS do layout e nunca o tocam: valor,
 * brilho e esmaecimento são classes e dado inline sobre caixas que já estão
 * paradas. Clique em cartão com `input` alterna o valor; clique em qualquer
 * outro cartão foca seu fecho causal; Esc ou clique no fundo desfaz.
 */

import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  causalClosure,
  readFocus,
  useSimulation,
  writeFocus,
} from "../viz/sim";
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
  const sim = useSimulation(spec);

  const [focus, setFocus] = useState<string | null>(() => readFocus(spec));
  const focusTouched = useRef(false);

  // Troca de flow na mesma montagem: o foco do anterior não atravessa.
  useEffect(() => {
    setFocus(readFocus(spec));
    focusTouched.current = false;
  }, [spec.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (focusTouched.current) writeFocus(focus);
  }, [focus]);

  useEffect(() => {
    if (!focus) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        focusTouched.current = true;
        setFocus(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus]);

  const focusSet = useMemo(
    () => (focus ? causalClosure(spec, focus) : null),
    [spec, focus]
  );

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
        data: {
          node: n,
          state: {
            value:
              sim.active && (n.input || n.compute)
                ? sim.values[n.id]
                : undefined,
            active: sim.activeIds.includes(n.id),
            dimmed: focusSet ? !focusSet.has(n.id) : false,
          },
        },
        width: r.w,
        height: r.h,
        draggable: false,
      });
    }

    const edges: Edge[] = result.edges.map(({ spec: e, fromSide, toSide }) => {
      const kind = (e.kind ?? "flow") as EdgeKind;
      const accent = e.accent ?? DEFAULT_ACCENT;
      const stroke = strokeFor(kind);

      // Fio vivo: só arestas `flow` carregam valor — aside e illumine são
      // anotação e presença, não condução.
      const live = sim.active && kind === "flow" && !!sim.values[e.from];
      const dimmed =
        focusSet && !(focusSet.has(e.from) && focusSet.has(e.to));

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
        className: [
          kind === "flow" ? "wire" : "",
          live ? "edge-live" : "",
          dimmed ? "dimmed" : "",
        ]
          .filter(Boolean)
          .join(" "),
        // Cor e fonte do rótulo vêm do CSS do tema (.react-flow__edge-text),
        // não daqui: cravar aqui vazava o bege do sāṃkhya para todo tema, e
        // fazia o desenho divergir da medida, que sempre usou a fonte do tema.
        // A custom property --accent alimenta o brilho do fio vivo no CSS.
        style: { stroke: accent, "--accent": accent, ...stroke } as never,
        labelBgPadding: [7, 4] as [number, number],
        labelBgBorderRadius: 2,
        markerEnd:
          kind === "illumine"
            ? undefined
            : { type: MarkerType.ArrowClosed, color: accent, width: 15, height: 15 },
      };
    });

    // O script de auditoria precisa saber quem pertence a qual moldura para
    // distinguir "contém o membro" de "invade o estranho" — e, na simulação,
    // o que o estado deveria ser para conferir com o que o DOM mostra.
    const w = window as unknown as {
      __flowMembership?: Record<string, string[]>;
      __simMeta?: { inputs: { id: string; cycle: unknown[] }[] } | null;
      __simValues?: Record<string, unknown>;
      __simActive?: string[];
    };
    w.__flowMembership = Object.fromEntries(
      (spec.groups ?? []).map((g) => [
        g.id,
        spec.nodes.filter((n) => n.group === g.id).map((n) => n.id),
      ])
    );
    w.__simMeta = sim.active
      ? {
          inputs: spec.nodes
            .filter((n) => n.input)
            .map((n) => ({ id: n.id, cycle: n.input!.cycle ?? [0, 1] })),
        }
      : null;
    w.__simValues = sim.values;
    w.__simActive = sim.activeIds;

    return { nodes, edges };
  }, [spec, measurements, sim.active, sim.values, sim.activeIds, focusSet]);

  return (
    <div className={`flow-canvas ${sim.active ? "sim" : ""}`}>
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
          onNodeClick={(_, node) => {
            if (node.id.startsWith("group:")) return;
            const n = spec.nodes.find((x) => x.id === node.id);
            if (!n) return;
            if (sim.active && n.input) {
              sim.toggle(n.id);
            } else {
              focusTouched.current = true;
              setFocus((f) => (f === n.id ? null : n.id));
            }
          }}
          onPaneClick={() => {
            if (focus) {
              focusTouched.current = true;
              setFocus(null);
            }
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={28}
            size={1}
            className="flow-dots"
          />
          <Controls showInteractive={false} position="bottom-right" />
        </ReactFlow>
      )}
    </div>
  );
}
