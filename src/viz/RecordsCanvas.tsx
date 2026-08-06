/**
 * A família de registros: um dado, várias projeções.
 *
 * Tabela mostra tudo; kanban agrupa por um campo `select`; gantt lê um campo
 * `range` e vira linha do tempo. Nenhuma vista duplica registro — trocar de
 * vista é trocar de leitura, e o seletor flutua como os demais controles do
 * site. Tudo é HTML/CSS sobre variáveis de tema; a única cor em JS é accent
 * de opção de select, que é dado como sempre.
 *
 * A vista corrente vive na URL (`?vista=kanban`).
 */

import { useEffect, useState } from "react";
import type {
  FieldSpec,
  RecordRow,
  RecordViewSpec,
  RecordsSpec,
} from "./types";
import "./records.css";

const VIEW_KEY = "vista";

const VIEW_LABEL: Record<RecordViewSpec["type"], string> = {
  table: "tabela",
  kanban: "kanban",
  gantt: "linha do tempo",
};

const readView = (spec: RecordsSpec): string | null => {
  const t = new URLSearchParams(window.location.search).get(VIEW_KEY);
  return t && spec.views.some((v) => v.type === t) ? t : null;
};

const writeView = (t: string) => {
  const params = new URLSearchParams(window.location.search);
  params.set(VIEW_KEY, t);
  history.replaceState(null, "", `${window.location.pathname}?${params}`);
};

/** Anos com era: -200 → "200 a.C.". Sem era, o número cru. */
const fmtYear = (n: number, era?: boolean) =>
  !era ? String(n) : n < 0 ? `${-n} a.C.` : `${n} d.C.`;

const fmtValue = (field: FieldSpec, value: RecordRow[string]): string => {
  if (value === undefined) return "—";
  if (Array.isArray(value))
    return `${fmtYear(value[0], field.era)} – ${fmtYear(value[1], field.era)}`;
  if (typeof value === "number") return fmtYear(value, field.era);
  const opt = field.options?.find((o) => o.id === value);
  return opt?.label ?? String(value);
};

const optionOf = (field: FieldSpec | undefined, value: RecordRow[string]) =>
  field?.options?.find((o) => o.id === value);

function TableView({ spec }: { spec: RecordsSpec }) {
  return (
    <table className="rec-table">
      <thead>
        <tr>
          {spec.fields.map((f) => (
            <th key={f.id}>{f.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {spec.rows.map((row) => (
          <tr key={row.id} data-rec={row.id}>
            {spec.fields.map((f) => {
              const opt = optionOf(f, row[f.id]);
              return (
                <td key={f.id} className={f.id === spec.titleField ? "rec-title" : ""}>
                  {opt?.accent && (
                    <span
                      className="rec-dot"
                      style={{ background: opt.accent }}
                    />
                  )}
                  {fmtValue(f, row[f.id])}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function KanbanView({
  spec,
  view,
}: {
  spec: RecordsSpec;
  view: Extract<RecordViewSpec, { type: "kanban" }>;
}) {
  const field = spec.fields.find((f) => f.id === view.groupBy);
  const groups = field?.options ?? [];
  return (
    <div className="rec-kanban">
      {groups.map((g) => {
        const rows = spec.rows.filter((r) => r[view.groupBy] === g.id);
        return (
          <div key={g.id} className="rec-col">
            <div
              className="rec-col-head"
              style={g.accent ? { color: g.accent } : undefined}
            >
              {g.label ?? g.id}
              <span className="rec-col-count">{rows.length}</span>
            </div>
            {rows.map((row) => (
              <div
                key={row.id}
                data-rec={row.id}
                className="rec-card"
                style={g.accent ? { borderLeftColor: g.accent } : undefined}
              >
                <div className="rec-card-title">
                  {fmtValue(
                    spec.fields.find((f) => f.id === spec.titleField)!,
                    row[spec.titleField]
                  )}
                </div>
                {spec.fields
                  .filter(
                    (f) => f.id !== spec.titleField && f.id !== view.groupBy
                  )
                  .slice(0, 2)
                  .map((f) => (
                    <div key={f.id} className="rec-card-line">
                      <span>{f.label}</span> {fmtValue(f, row[f.id])}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function GanttView({
  spec,
  view,
}: {
  spec: RecordsSpec;
  view: Extract<RecordViewSpec, { type: "gantt" }>;
}) {
  const rangeField = spec.fields.find((f) => f.id === view.range);
  const accentField = view.accentBy
    ? spec.fields.find((f) => f.id === view.accentBy)
    : undefined;

  const ranges = spec.rows
    .map((r) => r[view.range])
    .filter((v): v is [number, number] => Array.isArray(v));
  const min = Math.min(...ranges.map((r) => r[0]));
  const max = Math.max(...ranges.map((r) => r[1]));
  const span = max - min || 1;

  // Ticks em passos redondos, ~5 divisões.
  const rawStep = span / 5;
  const mag = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 5, 10]
    .map((m) => m * mag)
    .find((s) => span / s <= 6) ?? mag * 10;
  const ticks: number[] = [];
  for (let t = Math.ceil(min / step) * step; t <= max; t += step) ticks.push(t);

  const pct = (n: number) => ((n - min) / span) * 100;

  const sorted = [...spec.rows].sort((a, b) => {
    const ra = a[view.range];
    const rb = b[view.range];
    return (Array.isArray(ra) ? ra[0] : 0) - (Array.isArray(rb) ? rb[0] : 0);
  });

  return (
    <div className="rec-gantt">
      <div className="rec-gantt-axis">
        <span className="rec-gantt-label" />
        <div className="rec-gantt-track">
          {ticks.map((t) => (
            <span
              key={t}
              className="rec-gantt-tick"
              style={{ left: `${pct(t)}%` }}
            >
              {fmtYear(t, rangeField?.era)}
            </span>
          ))}
        </div>
      </div>
      {sorted.map((row) => {
        const range = row[view.range];
        if (!Array.isArray(range)) return null;
        const opt = optionOf(accentField, accentField ? row[accentField.id] : undefined);
        return (
          <div key={row.id} data-rec={row.id} className="rec-gantt-row">
            <span className="rec-gantt-label">
              {fmtValue(
                spec.fields.find((f) => f.id === spec.titleField)!,
                row[spec.titleField]
              )}
            </span>
            <div className="rec-gantt-track">
              {ticks.map((t) => (
                <span
                  key={t}
                  className="rec-gantt-grid"
                  style={{ left: `${pct(t)}%` }}
                />
              ))}
              <span
                className="rec-gantt-bar"
                style={{
                  left: `${pct(range[0])}%`,
                  width: `${pct(range[1]) - pct(range[0])}%`,
                  background: opt?.accent,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function RecordsCanvas({ spec }: { spec: RecordsSpec }) {
  const [viewType, setViewType] = useState(
    () => readView(spec) ?? spec.views[0]?.type
  );
  const view =
    spec.views.find((v) => v.type === viewType) ?? spec.views[0];

  useEffect(() => {
    setViewType(readView(spec) ?? spec.views[0]?.type);
  }, [spec.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Registro para a auditoria: vistas declaradas e contagem de linhas.
  useEffect(() => {
    const w = window as unknown as {
      __vizRegistry?: Record<string, Record<string, unknown>>;
    };
    const reg = (w.__vizRegistry ??= {});
    reg[spec.slug] = {
      ...(reg[spec.slug] ?? {}),
      records: { rows: spec.rows.length, views: spec.views.map((v) => v.type) },
    };
    return () => {
      delete reg[spec.slug];
    };
  }, [spec]);

  return (
    <div className="records" data-viz={spec.slug} data-viz-kind="records">
      <div className="records-wrap">
        {spec.views.length > 1 && (
          <div className="records-views">
            {spec.views.map((v) => (
              <button
                key={v.type}
                type="button"
                data-view={v.type}
                className={`records-view ${v.type === view.type ? "on" : ""}`}
                onClick={() => {
                  setViewType(v.type);
                  writeView(v.type);
                }}
              >
                {v.label ?? VIEW_LABEL[v.type]}
              </button>
            ))}
          </div>
        )}
        {view.type === "table" && <TableView spec={spec} />}
        {view.type === "kanban" && <KanbanView spec={spec} view={view} />}
        {view.type === "gantt" && <GanttView spec={spec} view={view} />}
      </div>
    </div>
  );
}
