/**
 * Auditoria geométrica.
 *
 * Screenshot é prova fraca: mostra que algo foi desenhado, não que está
 * certo. Este script lê as caixas reais do DOM depois do layout e verifica
 * as três coisas que quebraram na primeira versão:
 *
 *   1. dois cartões nunca se sobrepõem
 *   2. toda moldura contém seus membros de fato
 *   3. nenhuma moldura invade um nó que não é dela
 *
 * e mais uma que o motor precisa garantir para os rótulos serem legíveis:
 *
 *   4. nenhum rótulo de aresta cai por cima de um cartão
 *
 * Nos flows simulados há uma quinta, semântica: o script clica cada
 * combinação de entradas de verdade e cobra coerência entre o estado da
 * simulação (window.__simValues/__simActive) e o que o DOM mostra — badge,
 * `.is-on`, `.is-active`. Um flow que desenha certo mas conduz errado
 * reprova aqui.
 *
 * Uso:
 *   bun run audit                  todas as visualizações
 *   bun run audit samkhya          só uma
 *   bun run audit samkhya eletronica
 *
 * Screenshots caem em shots/<visualização>/<diagrama>.png.
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:4173";
/**
 * Escopo: `bun run audit` roda tudo, `bun run audit eletronica` roda só ela.
 * Uma visualização não toca na outra, então auditar a suíte inteira para
 * mexer numa só é desperdício — e o ruído esconde o que importa.
 */
const ONLY = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const OUT = "shots";

/** Folga tolerada: bordas encostando não é sobreposição. */
const EPS = 2;

const overlaps = (a, b) =>
  a.x + a.w - EPS > b.x &&
  b.x + b.w - EPS > a.x &&
  a.y + a.h - EPS > b.y &&
  b.y + b.h - EPS > a.y;

const contains = (outer, inner) =>
  inner.x >= outer.x - EPS &&
  inner.y >= outer.y - EPS &&
  inner.x + inner.w <= outer.x + outer.w + EPS &&
  inner.y + inner.h <= outer.y + outer.h + EPS;

/**
 * Uma página pode ter mais de um canvas (o comparativo): cada um é uma cena
 * própria, lida do seu container `data-viz` e casada com a entrada dele no
 * registro `window.__vizRegistry` — geometria e simulação nunca vazam de um
 * canvas para o outro.
 */
const readScenes = () => {
  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  };

  const scenes = [];
  for (const canvas of document.querySelectorAll("[data-viz]")) {
    const viz = canvas.getAttribute("data-viz");
    const nodes = [];
    const groups = [];
    for (const el of canvas.querySelectorAll(".react-flow__node")) {
      const id = el.getAttribute("data-id") ?? "";
      const entry = { id, ...rect(el) };
      if (id.startsWith("group:")) groups.push({ ...entry, id: id.slice(6) });
      else nodes.push(entry);
    }

    const labels = [];
    for (const el of canvas.querySelectorAll(".react-flow__edge-textwrapper")) {
      const edge = el.closest(".react-flow__edge");
      labels.push({ id: edge?.getAttribute("data-id") ?? "?", ...rect(el) });
    }

    scenes.push({ viz, nodes, groups, labels });
  }
  return scenes;
};

const run = async () => {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1100 },
    deviceScaleFactor: 2,
  });

  const warnings = [];
  page.on("console", (m) => {
    if (m.type() === "warning" || m.type() === "error")
      warnings.push(m.text());
  });

  let failures = 0;

  await page.goto(BASE + "/", { waitUntil: "networkidle" });

  // Rastreia a raiz para achar as coleções, e cada coleção para achar os
  // diagramas. Assim uma visualização nova entra na auditoria sozinha.
  const all = await page.$$eval(".coll-card", (as) =>
    as.map((a) => a.getAttribute("href").replace(/^\//, ""))
  );

  const unknown = ONLY.filter((c) => !all.includes(c));
  if (unknown.length) {
    console.error(`Não há visualização: ${unknown.join(", ")}`);
    console.error(`Disponíveis: ${all.join(", ")}`);
    await browser.close();
    process.exit(2);
  }

  const collections = ONLY.length ? all.filter((c) => ONLY.includes(c)) : all;

  // A home só é fotografada quando o escopo é o site inteiro: ela não
  // pertence a nenhuma visualização e não muda quando uma delas muda.
  if (!ONLY.length) {
    await page.screenshot({ path: `${OUT}/home.png`, fullPage: true });
  }

  const routes = [];
  for (const c of collections) {
    mkdirSync(`${OUT}/${c}`, { recursive: true });
    await page.goto(`${BASE}/${c}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${OUT}/${c}/_index.png`, fullPage: true });
    const found = await page.$$eval(".flow-card", (as) =>
      as.map((a) => a.getAttribute("href").replace(/^\//, ""))
    );
    routes.push(...found);
  }

  for (const slug of routes) {
    warnings.length = 0;
    await page.goto(`${BASE}/${slug}`, { waitUntil: "networkidle" });
    await page.waitForSelector(".react-flow__node", { timeout: 10000 });
    // fitView anima; esperar assentar antes de medir.
    await page.waitForTimeout(900);

    const scenes = await page.evaluate(readScenes);
    const problems = [];
    let totals = { nodes: 0, groups: 0, labels: 0, simStates: 0 };
    // Página sem cena ou cena vazia é falha, não sucesso: um dist velho sem
    // data-viz já produziu um "ok · 0 nós" falso-verde aqui.
    if (!scenes.length) problems.push("nenhuma cena encontrada (data-viz)");
    for (const s of scenes)
      if (!s.nodes.length) problems.push(`cena "${s.viz}" sem nós`);
    // Numa página de um canvas só, o prefixo de cena é ruído.
    const tagOf = (viz) => (scenes.length > 1 ? `[${viz}] ` : "");

    for (const { viz, nodes, groups, labels } of scenes) {
      totals.nodes += nodes.length;
      totals.groups += groups.length;
      totals.labels += labels.length;

      // 1. cartão contra cartão
      for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++)
          if (overlaps(nodes[i], nodes[j]))
            problems.push(
              `${tagOf(viz)}sobreposição: ${nodes[i].id} × ${nodes[j].id}`
            );

      // 2 e 3. molduras
      const membership = await page.evaluate(
        (v) => window.__vizRegistry?.[v]?.membership ?? {},
        viz
      );
      for (const g of groups) {
        const members = membership[g.id] ?? [];
        for (const n of nodes) {
          const isMember = members.includes(n.id);
          if (isMember && !contains(g, n))
            problems.push(
              `${tagOf(viz)}moldura "${g.id}" não contém membro ${n.id}`
            );
          if (!isMember && overlaps(g, n))
            problems.push(`${tagOf(viz)}moldura "${g.id}" invade ${n.id}`);
        }
      }

      // 4. rótulo contra cartão
      for (const l of labels)
        for (const n of nodes)
          if (overlaps(l, n))
            problems.push(
              `${tagOf(viz)}rótulo "${l.id}" por cima do cartão ${n.id}`
            );

      // 5. simulação — clica cada combinação de entradas e cobra coerência
      // entre o estado (registro do canvas) e o que o DOM daquele canvas
      // mostra. A última combinação é a de tudo em 1, de propósito: o
      // screenshot sai energizado.
      const simMeta = await page.evaluate(
        (v) => window.__vizRegistry?.[v]?.sim ?? null,
        viz
      );
      if (simMeta?.inputs?.length) {
        const combos = simMeta.inputs.reduce(
          (acc, input) =>
            acc.flatMap((c) => input.cycle.map((v) => [...c, [input.id, v]])),
          [[]]
        );

        for (const combo of combos.slice(0, 16)) {
          for (const [id, target] of combo) {
            for (let k = 0; k < 4; k++) {
              const cur = await page.evaluate(
                ([v, i]) => window.__vizRegistry?.[v]?.values?.[i],
                [viz, id]
              );
              if (String(cur) === String(target)) break;
              await page.click(
                `[data-viz="${viz}"] .react-flow__node[data-id="${id}"]`
              );
              await page.waitForTimeout(50);
            }
          }
          totals.simStates += 1;

          const mismatches = await page.evaluate((v) => {
            const entry = window.__vizRegistry?.[v] ?? {};
            const values = entry.values ?? {};
            const active = new Set(entry.activeIds ?? []);
            const out = [];
            for (const el of document.querySelectorAll(
              `[data-viz="${v}"] .react-flow__node .concept`
            )) {
              const id = el
                .closest(".react-flow__node")
                ?.getAttribute("data-id");
              const badge = el.querySelector(".concept-value");
              if (badge) {
                if (el.classList.contains("is-on") !== !!values[id])
                  out.push(`is-on incoerente em ${id}`);
                if (badge.textContent !== String(values[id]))
                  out.push(
                    `badge de ${id} mostra "${badge.textContent}", valor é ${values[id]}`
                  );
              }
              if (el.classList.contains("is-active") !== active.has(id))
                out.push(`is-active incoerente em ${id}`);
            }
            return out;
          }, viz);
          for (const m of mismatches)
            problems.push(
              `${tagOf(viz)}sim ${combo
                .map(([i, v]) => `${i}=${v}`)
                .join(",")}: ${m}`
            );
        }
      }
    }

    await page.screenshot({ path: `${OUT}/${slug}.png`, fullPage: true });

    const tag = problems.length ? "FALHA" : "ok   ";
    console.log(
      `${tag} ${slug.padEnd(24)} ${String(totals.nodes).padStart(2)} nós · ` +
        `${totals.groups} molduras · ${totals.labels} rótulos` +
        (totals.simStates ? ` · sim ${totals.simStates} estados` : "") +
        (scenes.length > 1 ? ` · ${scenes.length} cenas` : "")
    );
    for (const p of problems) console.log(`        · ${p}`);
    for (const w of warnings) console.log(`        ! ${w}`);
    failures += problems.length;
  }

  await browser.close();
  const escopo = ONLY.length ? ONLY.join(", ") : "todas as visualizações";
  console.log(
    failures
      ? `\n${failures} problema(s) geométrico(s) — ${escopo}.`
      : `\nGeometria limpa — ${escopo}.`
  );
  process.exit(failures ? 1 : 0);
};

run();
