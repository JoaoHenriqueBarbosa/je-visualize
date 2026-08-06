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

import { layout, type LayoutInput, type LayoutResult } from "./layout";
import { nodeTypes } from "./nodes";
import { useMeasurements } from "./Measurer";
import {
  causalClosure,
  evaluateSpec,
  readFocus,
  useSimulation,
  writeFocus,
  type SharedSim,
} from "../viz/sim";
import type { EdgeKind, FlowSpec, NodeSpec, SimValue } from "./types";
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
    case "attacks":
      return { strokeDasharray: "7 3", strokeWidth: 1.6 };
    default: // flow e supports
      return { strokeDasharray: "0", strokeWidth: 1.7 };
  }
};

/** Estado imposto de fora (o autômato dirige o canvas por aqui). */
export interface CanvasDrive {
  /** Cartões acesos além dos `activeWhen` — o estado corrente da máquina. */
  activeIds?: string[];
  /** Arestas vivas forçadas, por id `from->to` — a última transição. */
  liveEdges?: string[];
}

export default function FlowCanvas({
  spec,
  shared,
  urlSync = true,
  drive,
  focusable = true,
  layoutFn,
}: {
  spec: FlowSpec;
  /** Inputs de fora (comparativo): o canvas usa e alterna, mas não possui. */
  shared?: SharedSim;
  /** false quando outro dono escreve a URL (o comparativo, pelos dois). */
  urlSync?: boolean;
  drive?: CanvasDrive;
  /** false desliga o modo foco — numa máquina, clique em estado não navega. */
  focusable?: boolean;
  /** Posicionador alternativo (o ciclo passa o polar). Default: a grade. */
  layoutFn?: (input: LayoutInput) => LayoutResult;
}) {
  const { measurements, stage } = useMeasurements(spec);
  const sim = useSimulation(spec, shared);

  const [focus, setFocus] = useState<string | null>(() =>
    urlSync ? readFocus(spec) : null
  );
  const focusTouched = useRef(false);

  // Troca de flow na mesma montagem: o foco do anterior não atravessa.
  useEffect(() => {
    setFocus(urlSync ? readFocus(spec) : null);
    focusTouched.current = false;
  }, [spec.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (urlSync && focusTouched.current) writeFocus(focus);
  }, [focus, urlSync]);

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

  // ------------------------------------------------------------- o passeio
  // step -1 = vista completa; 0..n-1 = passos. O acumulado é derivado: cada
  // passo declara só o que ENTRA. URL: ?passo=1-based.
  const steps = spec.steps;
  const readStep = () => {
    if (!steps) return -1;
    const raw = Number(new URLSearchParams(window.location.search).get("passo"));
    return raw >= 1 && raw <= steps.length ? raw - 1 : -1;
  };
  const [step, setStep] = useState(readStep);

  useEffect(() => {
    setStep(readStep());
  }, [spec.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const goStep = (next: number) => {
    setStep(next);
    const params = new URLSearchParams(window.location.search);
    if (next >= 0) params.set("passo", String(next + 1));
    else params.delete("passo");
    const q = params.toString();
    history.replaceState(null, "", window.location.pathname + (q ? `?${q}` : ""));
  };

  const stepSet = useMemo(() => {
    if (!steps || step < 0) return null;
    const out = new Set<string>();
    for (let i = 0; i <= step; i++) steps[i].ids.forEach((id) => out.add(id));
    return out;
  }, [steps, step]);

  // Foco e passeio dão esmaecimento; durante um passo, o passeio manda.
  const dimSet = stepSet ?? focusSet;

  // Séries e amostras de um cartão-instrumento. Com `sweep`, cada estado da
  // varredura passa pelo MESMO avaliador da simulação; sem, a fonte é o
  // histórico do que o leitor alternou.
  const chartFor = (n: NodeSpec) => {
    if (!n.chart) return undefined;
    const accentOf = (id: string) =>
      spec.nodes.find((x) => x.id === id)?.accent ?? DEFAULT_ACCENT;
    const series = n.chart.watch.map((w) => ({
      id: w.id,
      label: w.label ?? w.id,
      accent: accentOf(w.id),
    }));
    const defaults: Record<string, SimValue> = {};
    for (const x of spec.nodes) if (x.input) defaults[x.id] = x.input.initial;
    const rows = n.chart.sweep
      ? n.chart.sweep.map((s) => evaluateSpec(spec, { ...defaults, ...s }))
      : sim.history.map((h) => h.values);
    return { series, rows };
  };

  const graph = useMemo(() => {
    if (!measurements) return null;
    const result = (layoutFn ?? layout)({ spec, ...measurements });

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
            active:
              sim.activeIds.includes(n.id) ||
              !!drive?.activeIds?.includes(n.id),
            dimmed: dimSet ? !dimSet.has(n.id) : false,
            chart: chartFor(n),
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
      // anotação e presença, não condução. O drive pode acender qualquer
      // aresta (a transição que a máquina acabou de tomar).
      const live =
        (sim.active && kind === "flow" && !!sim.values[e.from]) ||
        !!drive?.liveEdges?.includes(`${e.from}->${e.to}`);
      const dimmed =
        dimSet && !(dimSet.has(e.from) && dimSet.has(e.to));

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
    // o que o estado deveria ser para conferir com o que o DOM mostra. O
    // registro é POR CANVAS (chave = slug, casada com data-viz no DOM):
    // o comparativo põe dois canvases na mesma página e globals disputariam.
    const w = window as unknown as {
      __vizRegistry?: Record<string, Record<string, unknown>>;
    };
    const reg = (w.__vizRegistry ??= {});
    // Merge, nunca substituição: quem embrulha este canvas (a máquina) põe
    // as próprias chaves na mesma entrada, e pode não re-renderizar quando
    // este memo roda — substituir aqui já engoliu o bloco `machine` uma vez.
    reg[spec.slug] = {
      ...(reg[spec.slug] ?? {}),
      membership: Object.fromEntries(
        (spec.groups ?? []).map((g) => [
          g.id,
          spec.nodes.filter((n) => n.group === g.id).map((n) => n.id),
        ])
      ),
      sim: sim.active
        ? {
            inputs: spec.nodes
              .filter((n) => n.input)
              .map((n) => ({ id: n.id, cycle: n.input!.cycle ?? [0, 1] })),
          }
        : null,
      values: sim.values,
      activeIds: sim.activeIds,
      walk: spec.steps ? { steps: spec.steps.length } : null,
    };

    return { nodes, edges };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec, measurements, sim.active, sim.values, sim.activeIds, sim.history, dimSet, drive, layoutFn]);

  // Sai do registro ao desmontar: numa SPA a entrada sobreviveria à rota.
  useEffect(() => {
    return () => {
      delete (window as unknown as { __vizRegistry?: Record<string, unknown> })
        .__vizRegistry?.[spec.slug];
    };
  }, [spec.slug]);

  return (
    <div
      className={`flow-canvas ${sim.active ? "sim" : ""}`}
      data-viz={spec.slug}
      data-viz-kind="flow"
    >
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
            } else if (focusable) {
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
      {steps && (
        <div className="walk" data-walk>
          <button
            type="button"
            className="walk-btn"
            disabled={step < 0}
            onClick={() => goStep(step - 1)}
            aria-label="passo anterior"
          >
            ‹
          </button>
          <div className="walk-note">
            {step < 0 ? (
              <span className="walk-note-text muted">
                vista completa — › percorre o diagrama
              </span>
            ) : (
              <span className="walk-note-text">{steps[step].note}</span>
            )}
            <span className="walk-count">
              {step < 0 ? `${steps.length} passos` : `${step + 1}/${steps.length}`}
            </span>
          </div>
          <button
            type="button"
            className="walk-btn"
            data-walk-next
            disabled={step >= steps.length - 1}
            onClick={() => goStep(step + 1)}
            aria-label="próximo passo"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
