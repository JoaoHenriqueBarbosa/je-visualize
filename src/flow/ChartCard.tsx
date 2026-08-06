/**
 * O instrumento dentro do cartão: faixas de onda digital, estilo analisador
 * lógico — cada sinal na sua pista, degrau para cima é 1.
 *
 * Recharts SEM ResponsiveContainer, de propósito: o container tem tamanho
 * fixo pelo CSS (--card-chart-h, largura do cartão), o componente lê a caixa
 * uma vez e entrega width/height numéricos. ResponsiveContainer observa e
 * re-renderiza; aqui nada muda de tamanho depois de medido — a mesma
 * disciplina do motor.
 *
 * Cores: as séries são pintadas pelos ACCENTS dos nós observados — dado do
 * flow, como sempre. O restante (pista, texto) vem das variáveis do tema,
 * lidas do container via getComputedStyle: a ponte controlada para uma
 * biblioteca que só aceita cor por prop. Nenhum hex de tema em JS.
 */

import { useLayoutEffect, useRef, useState } from "react";
import { Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";
import type { SimValue } from "./types";

export interface ChartData {
  series: { id: string; label: string; accent: string }[];
  rows: Record<string, SimValue>[];
}

/** Altura de uma pista em unidades de dado; o vão entre pistas é o resto. */
const LANE_AMP = 1;
const LANE_GAP = 0.7;
const LANE_STEP = LANE_AMP + LANE_GAP;

export default function ChartCard({ data }: { data: ChartData }) {
  const host = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [themeInk, setThemeInk] = useState<{ rule: string }>({ rule: "" });

  // Uma leitura, sem observer: a caixa é fixa por CSS e as variáveis do tema
  // não mudam durante a vida da página.
  useLayoutEffect(() => {
    const el = host.current;
    if (!el) return;
    const style = getComputedStyle(el);
    setBox({ w: el.clientWidth, h: el.clientHeight });
    setThemeInk({ rule: style.getPropertyValue("--rule").trim() });
  }, []);

  const { series, rows } = data;

  // Última amostra duplicada: stepAfter só desenha até o último x, e a onda
  // deve mostrar o estado atual como um patamar, não como uma ponta.
  const extended = rows.length ? [...rows, rows[rows.length - 1]] : [];
  const points = extended.map((row, x) => {
    const p: Record<string, number> = { x };
    series.forEach((s, i) => {
      const base = (series.length - 1 - i) * LANE_STEP;
      p[s.id] = base + (row[s.id] ? LANE_AMP : 0);
    });
    return p;
  });

  const yMax = (series.length - 1) * LANE_STEP + LANE_AMP;

  return (
    <>
      <div className="concept-chart" ref={host}>
        {box && (
          <LineChart
            width={box.w}
            height={box.h}
            data={points}
            margin={{ top: 6, right: 2, bottom: 2, left: 2 }}
          >
            <XAxis dataKey="x" hide />
            <YAxis hide domain={[-0.25, yMax + 0.25]} />
            {series.map((s, i) => (
              <ReferenceLine
                key={`base-${s.id}`}
                y={(series.length - 1 - i) * LANE_STEP}
                stroke={themeInk.rule}
                strokeDasharray="3 5"
              />
            ))}
            {series.map((s) => (
              <Line
                key={s.id}
                dataKey={s.id}
                type="stepAfter"
                stroke={s.accent}
                strokeWidth={1.6}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        )}
      </div>
      <div className="concept-chart-legend">
        {series.map((s) => (
          <span key={s.id} style={{ color: s.accent || undefined }}>
            {s.label}
          </span>
        ))}
      </div>
    </>
  );
}
