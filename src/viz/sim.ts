/**
 * A camada de simulação — um grafo de valores por cima do grafo visual.
 *
 * O spec declara três coisas (src/flow/types.ts): `input` torna um cartão
 * clicável, `compute` deriva um valor dos demais, `activeWhen` acende um
 * cartão enquanto uma condição vale. Este módulo avalia isso e nada mais:
 * quem decide o que "aceso" significa é o CSS do tema, e quem posiciona
 * continua sendo o motor — simulação nunca move caixa.
 *
 * A avaliação é por relaxamento com limite de passadas, não por ordenação
 * topológica: um `compute` pode ler qualquer nó, inclusive formando ciclo
 * (latch SR, adiante no roadmap). Ciclo estável converge; instável para no
 * limite e fica no último valor — oscilar para sempre não trava a página.
 *
 * O estado dos inputs vive na URL (`?sim=a:1,b:0`): toda configuração é um
 * link. A escrita é replaceState para não poluir o histórico de navegação.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FlowSpec, SimValue } from "../flow/types";

const URL_KEY = "sim";

/** Passadas máximas do relaxamento além do necessário para convergir. */
const MAX_EXTRA_PASSES = 8;

export interface Simulation {
  /** false = flow estático; nada foi declarado e nada muda. */
  active: boolean;
  /** Valor corrente de cada nó que tem um (inputs e derivados). */
  values: Record<string, SimValue>;
  /** Ids com `activeWhen` verdadeiro agora. */
  activeIds: string[];
  /** Inputs já alternados, em ordem — o histórico que alimenta os charts. */
  history: { step: number; values: Record<string, SimValue> }[];
  toggle: (id: string) => void;
}

/** Avalia derivados por relaxamento a partir dos inputs correntes. */
const evaluate = (
  spec: FlowSpec,
  inputs: Record<string, SimValue>
): Record<string, SimValue> => {
  const values: Record<string, SimValue> = { ...inputs };
  const derived = spec.nodes.filter((n) => n.compute);
  for (let pass = 0; pass < derived.length + MAX_EXTRA_PASSES; pass++) {
    let moved = false;
    for (const n of derived) {
      const next = n.compute!(values);
      if (values[n.id] !== next) {
        values[n.id] = next;
        moved = true;
      }
    }
    if (!moved) break;
  }
  return values;
};

const cycleOf = (spec: FlowSpec, id: string): SimValue[] => {
  const input = spec.nodes.find((n) => n.id === id)?.input;
  return input?.cycle ?? [0, 1];
};

/** `a:1,b:0` — números voltam como números, o resto como string. */
const parseUrl = (spec: FlowSpec): Record<string, SimValue> => {
  const raw = new URLSearchParams(window.location.search).get(URL_KEY);
  const out: Record<string, SimValue> = {};
  if (!raw) return out;
  for (const pair of raw.split(",")) {
    const [id, v] = pair.split(":");
    if (!spec.nodes.some((n) => n.id === id && n.input)) continue;
    const num = Number(v);
    const value: SimValue = Number.isNaN(num) ? v : num;
    if (cycleOf(spec, id).includes(value)) out[id] = value;
  }
  return out;
};

const writeUrl = (inputs: Record<string, SimValue>) => {
  const params = new URLSearchParams(window.location.search);
  params.set(
    URL_KEY,
    Object.entries(inputs)
      .map(([id, v]) => `${id}:${v}`)
      .join(",")
  );
  history.replaceState(null, "", `${window.location.pathname}?${params}`);
};

const initialInputs = (spec: FlowSpec): Record<string, SimValue> => {
  const out: Record<string, SimValue> = {};
  for (const n of spec.nodes) if (n.input) out[n.id] = n.input.initial;
  return { ...out, ...parseUrl(spec) };
};

export function useSimulation(spec: FlowSpec): Simulation {
  const active = useMemo(
    () => spec.nodes.some((n) => n.input || n.compute),
    [spec]
  );

  const [inputs, setInputs] = useState(() => initialInputs(spec));
  const [history, setHistory] = useState<Simulation["history"]>([]);
  const step = useRef(0);
  const touched = useRef(false);

  // Troca de flow na mesma montagem: recomeça do spec novo, não herda estado.
  useEffect(() => {
    setInputs(initialInputs(spec));
    setHistory([]);
    step.current = 0;
    touched.current = false;
  }, [spec.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const values = useMemo(
    () => (active ? evaluate(spec, inputs) : {}),
    [spec, inputs, active]
  );

  const activeIds = useMemo(
    () =>
      active
        ? spec.nodes.filter((n) => n.activeWhen?.(values)).map((n) => n.id)
        : [],
    [spec, values, active]
  );

  // A URL só passa a ser escrita depois do primeiro gesto: o link limpo
  // continua limpo para quem só olha.
  useEffect(() => {
    if (touched.current) writeUrl(inputs);
  }, [inputs]);

  const toggle = useCallback(
    (id: string) => {
      const cycle = cycleOf(spec, id);
      touched.current = true;
      setInputs((prev) => {
        const next = {
          ...prev,
          [id]: cycle[(cycle.indexOf(prev[id]) + 1) % cycle.length],
        };
        step.current += 1;
        setHistory((h) => [
          ...h,
          { step: step.current, values: evaluate(spec, next) },
        ]);
        return next;
      });
    },
    [spec]
  );

  return { active, values, activeIds, history, toggle };
}

const FOCUS_KEY = "foco";

/** Foco vindo da URL, validado contra o spec. */
export const readFocus = (spec: FlowSpec): string | null => {
  const id = new URLSearchParams(window.location.search).get(FOCUS_KEY);
  return id && spec.nodes.some((n) => n.id === id) ? id : null;
};

export const writeFocus = (id: string | null) => {
  const params = new URLSearchParams(window.location.search);
  if (id) params.set(FOCUS_KEY, id);
  else params.delete(FOCUS_KEY);
  const q = params.toString();
  history.replaceState(
    null,
    "",
    window.location.pathname + (q ? `?${q}` : "")
  );
};

/**
 * Fecho causal de um nó: ancestrais ∪ descendentes pelas arestas `flow` —
 * duas varreduras direcionais, não uma inundação (inundar incluiria os
 * irmãos: a→porta e b→porta poriam b no fecho de a).
 *
 * Só `flow` participa, e no sāṃkhya isso é doutrina por acidente feliz:
 * puruṣa toca o diagrama por `illumine`, presença não-causal — focar um
 * tattva nunca o inclui, que é exatamente o que o Sāṃkhya afirma.
 */
export const causalClosure = (spec: FlowSpec, id: string): Set<string> => {
  const flows = spec.edges.filter((e) => (e.kind ?? "flow") === "flow");
  const sweep = (start: string, dir: "down" | "up") => {
    const seen = new Set([start]);
    const queue = [start];
    while (queue.length) {
      const cur = queue.pop()!;
      for (const e of flows) {
        const next =
          dir === "down"
            ? e.from === cur
              ? e.to
              : null
            : e.to === cur
              ? e.from
              : null;
        if (next && !seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
      }
    }
    return seen;
  };
  return new Set([...sweep(id, "down"), ...sweep(id, "up")]);
};
