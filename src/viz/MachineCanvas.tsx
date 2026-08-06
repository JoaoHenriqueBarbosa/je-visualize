/**
 * O autômato: estados como cartões, transições como arestas, eventos como
 * botões. Quem muda de estado é o evento — clique em cartão não navega
 * (focusable desligado), e botão sem transição aplicável fica mudo, o que é
 * conteúdo: um estado terminal se anuncia pelos botões todos desabilitados.
 *
 * Reusa o FlowCanvas inteiro sintetizando um FlowSpec: estados viram nós
 * (redondos por default), transições viram arestas `aside` — numa máquina o
 * ciclo é a norma, então nenhuma aresta pode derivar camada e o autor
 * declara rank/column nos estados. O estado corrente e a última transição
 * entram pelo `drive`.
 *
 * O estado corrente vive na URL (`?estado=id`): toda configuração é um link.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import FlowCanvas from "../flow/FlowCanvas";
import type { FlowSpec } from "../flow/types";
import type { MachineSpec } from "./types";

const STATE_KEY = "estado";

const readState = (spec: MachineSpec): string | null => {
  const id = new URLSearchParams(window.location.search).get(STATE_KEY);
  return id && spec.states.some((s) => s.id === id) ? id : null;
};

const writeState = (id: string) => {
  const params = new URLSearchParams(window.location.search);
  params.set(STATE_KEY, id);
  history.replaceState(null, "", `${window.location.pathname}?${params}`);
};

export default function MachineCanvas({ spec }: { spec: MachineSpec }) {
  const initial =
    spec.states.find((s) => s.initial)?.id ?? spec.states[0]?.id;

  const [current, setCurrent] = useState(() => readState(spec) ?? initial);
  const [lastEdge, setLastEdge] = useState<string | null>(null);
  const touched = useRef(false);

  // Troca de máquina na mesma montagem: acorda no estado inicial da nova.
  useEffect(() => {
    setCurrent(readState(spec) ?? initial);
    setLastEdge(null);
    touched.current = false;
  }, [spec.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (touched.current) writeState(current);
  }, [current]);

  const flow: FlowSpec = useMemo(
    () => ({
      slug: spec.slug,
      title: spec.title,
      subtitle: spec.subtitle,
      blurb: spec.blurb,
      nodes: spec.states.map(({ initial: _initial, ...s }) => ({
        ...s,
        round: s.round ?? true,
      })),
      edges: spec.transitions.map((t) => ({
        from: t.from,
        to: t.to,
        label:
          t.label ??
          spec.events.find((e) => e.id === t.event)?.label ??
          t.event,
        kind: "aside" as const,
        accent: t.accent,
        fromSide: t.fromSide,
        toSide: t.toSide,
      })),
    }),
    [spec]
  );

  const applicable = (eventId: string) =>
    spec.transitions.find((t) => t.from === current && t.event === eventId);

  const fire = (eventId: string) => {
    const t = applicable(eventId);
    if (!t) return;
    touched.current = true;
    setCurrent(t.to);
    setLastEdge(`${t.from}->${t.to}`);
  };

  const drive = useMemo(
    () => ({
      activeIds: [current],
      liveEdges: lastEdge ? [lastEdge] : [],
    }),
    [current, lastEdge]
  );

  // Registro para a auditoria semântica de máquina. Sem deps de propósito:
  // o FlowCanvas reescreve a entrada do slug a cada rebuild do grafo, e este
  // efeito (que roda depois, por ser do pai) recoloca o bloco `machine`.
  useEffect(() => {
    const w = window as unknown as {
      __vizRegistry?: Record<string, Record<string, unknown>>;
    };
    const reg = (w.__vizRegistry ??= {});
    reg[spec.slug] = {
      ...(reg[spec.slug] ?? {}),
      machine: {
        current,
        events: spec.events.map((e) => e.id),
        transitions: spec.transitions.map(({ from, to, event }) => ({
          from,
          to,
          event,
        })),
      },
    };
  });

  return (
    <div className="machine">
      <FlowCanvas spec={flow} urlSync={false} focusable={false} drive={drive} />
      <div className="machine-events" data-viz-events={spec.slug}>
        {spec.events.map((e) => (
          <button
            key={e.id}
            type="button"
            data-event={e.id}
            className="machine-event"
            disabled={!applicable(e.id)}
            style={
              e.accent
                ? ({ "--accent": e.accent } as React.CSSProperties)
                : undefined
            }
            onClick={() => fire(e.id)}
          >
            {e.label ?? e.id}
          </button>
        ))}
      </div>
    </div>
  );
}
