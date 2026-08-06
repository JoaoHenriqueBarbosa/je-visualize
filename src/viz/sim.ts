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
  /**
   * A linha do tempo: o estado inicial no passo 0 e um passo por alternância.
   * É o que os cartões-instrumento desenham. Limitado aos últimos
   * HISTORY_MAX passos — osciloscópio tem tela, não memória infinita.
   */
  history: { step: number; values: Record<string, SimValue> }[];
  toggle: (id: string) => void;
}

/** Passos retidos no histórico. */
const HISTORY_MAX = 64;

/**
 * Avalia derivados por relaxamento a partir dos inputs correntes. Exportada
 * porque os cartões-instrumento com `sweep` avaliam o spec para cada estado
 * da varredura — o mesmo avaliador, nunca uma segunda lógica.
 */
export const evaluateSpec = (
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

/**
 * Inputs compartilhados entre specs (o comparativo): um só estado, um só
 * toggle, uma só URL. Cada canvas continua com sua própria avaliação — a
 * mesma entrada atravessa computes diferentes, e é essa diferença que o
 * comparativo existe para mostrar.
 */
export interface SharedSim {
  inputs: Record<string, SimValue>;
  toggle: (id: string) => void;
}

export function useSharedSim(specs: FlowSpec[]): SharedSim {
  const key = specs.map((s) => s.slug).join("|");

  const initial = useCallback(() => {
    const out: Record<string, SimValue> = {};
    for (const spec of specs) Object.assign(out, initialInputs(spec));
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const [inputs, setInputs] = useState(initial);
  const touched = useRef(false);

  useEffect(() => {
    setInputs(initial());
    touched.current = false;
  }, [initial]);

  useEffect(() => {
    if (touched.current) writeUrl(inputs);
  }, [inputs]);

  const toggle = useCallback(
    (id: string) => {
      const owner = specs.find((s) =>
        s.nodes.some((n) => n.id === id && n.input)
      );
      if (!owner) return;
      const cycle = cycleOf(owner, id);
      touched.current = true;
      setInputs((prev) => ({
        ...prev,
        [id]: cycle[(cycle.indexOf(prev[id]) + 1) % cycle.length],
      }));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [key]
  );

  return { inputs, toggle };
}

const sameValues = (
  a: Record<string, SimValue>,
  b: Record<string, SimValue>
) => {
  const ka = Object.keys(a);
  return ka.length === Object.keys(b).length && ka.every((k) => a[k] === b[k]);
};

export function useSimulation(spec: FlowSpec, shared?: SharedSim): Simulation {
  const active = useMemo(
    () => spec.nodes.some((n) => n.input || n.compute),
    [spec]
  );

  const [localInputs, setLocalInputs] = useState(() => initialInputs(spec));
  const [history, setHistory] = useState<Simulation["history"]>([]);
  const touched = useRef(false);

  // Troca de flow na mesma montagem: recomeça do spec novo, não herda estado.
  useEffect(() => {
    setLocalInputs(initialInputs(spec));
    setHistory([]);
    touched.current = false;
  }, [spec.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const inputs = shared?.inputs ?? localInputs;

  const values = useMemo(
    () => (active ? evaluateSpec(spec, inputs) : {}),
    [spec, inputs, active]
  );

  // O histórico deriva da sequência de estados, venha o toggle de onde vier
  // (local ou compartilhado): cada estado novo é um passo, o primeiro é o 0.
  useEffect(() => {
    if (!active) return;
    setHistory((h) => {
      const last = h[h.length - 1];
      if (last && sameValues(last.values, values)) return h;
      return [
        ...h,
        { step: last ? last.step + 1 : 0, values },
      ].slice(-HISTORY_MAX);
    });
  }, [values, active]);

  const activeIds = useMemo(
    () =>
      active
        ? spec.nodes.filter((n) => n.activeWhen?.(values)).map((n) => n.id)
        : [],
    [spec, values, active]
  );

  // A URL só passa a ser escrita depois do primeiro gesto: o link limpo
  // continua limpo para quem só olha. Com inputs compartilhados quem escreve
  // é o dono deles (useSharedSim), nunca o canvas.
  useEffect(() => {
    if (!shared && touched.current) writeUrl(inputs);
  }, [inputs, shared]);

  const localToggle = useCallback(
    (id: string) => {
      const cycle = cycleOf(spec, id);
      touched.current = true;
      setLocalInputs((prev) => ({
        ...prev,
        [id]: cycle[(cycle.indexOf(prev[id]) + 1) % cycle.length],
      }));
    },
    [spec]
  );

  return {
    active,
    values,
    activeIds,
    history,
    toggle: shared?.toggle ?? localToggle,
  };
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
