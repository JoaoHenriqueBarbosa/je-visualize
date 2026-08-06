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
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:4173";
/** Descoberto navegando, não declarado: o audit não desatualiza sozinho. */
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

const readScene = () => {
  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  };

  const nodes = [];
  const groups = [];
  for (const el of document.querySelectorAll(".react-flow__node")) {
    const id = el.getAttribute("data-id") ?? "";
    const entry = { id, ...rect(el) };
    if (id.startsWith("group:")) groups.push({ ...entry, id: id.slice(6) });
    else nodes.push(entry);
  }

  const labels = [];
  for (const el of document.querySelectorAll(".react-flow__edge-textwrapper")) {
    const edge = el.closest(".react-flow__edge");
    labels.push({
      id: edge?.getAttribute("data-id") ?? "?",
      ...rect(el),
    });
  }

  return { nodes, groups, labels };
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
  await page.screenshot({ path: `${OUT}/home.png`, fullPage: true });

  // Rastreia a raiz para achar as coleções, e cada coleção para achar os
  // diagramas. Assim uma visualização nova entra na auditoria sozinha.
  const collections = await page.$$eval(".coll-card", (as) =>
    as.map((a) => a.getAttribute("href").replace(/^\//, ""))
  );

  const routes = [];
  for (const c of collections) {
    await page.goto(`${BASE}/${c}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${OUT}/${c}.png`, fullPage: true });
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

    const { nodes, groups, labels } = await page.evaluate(readScene);
    const problems = [];

    // 1. cartão contra cartão
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++)
        if (overlaps(nodes[i], nodes[j]))
          problems.push(`sobreposição: ${nodes[i].id} × ${nodes[j].id}`);

    // 2 e 3. molduras
    const membership = await page.evaluate(() =>
      window.__flowMembership ?? {}
    );
    for (const g of groups) {
      const members = membership[g.id] ?? [];
      for (const n of nodes) {
        const isMember = members.includes(n.id);
        if (isMember && !contains(g, n))
          problems.push(`moldura "${g.id}" não contém membro ${n.id}`);
        if (!isMember && overlaps(g, n))
          problems.push(`moldura "${g.id}" invade ${n.id}`);
      }
    }

    // 4. rótulo contra cartão
    for (const l of labels)
      for (const n of nodes)
        if (overlaps(l, n))
          problems.push(`rótulo "${l.id}" por cima do cartão ${n.id}`);

    await page.screenshot({
      path: `${OUT}/${slug.replace(/\//g, "-")}.png`,
      fullPage: true,
    });

    const tag = problems.length ? "FALHA" : "ok   ";
    console.log(
      `${tag} ${slug.padEnd(24)} ${String(nodes.length).padStart(2)} nós · ` +
        `${groups.length} molduras · ${labels.length} rótulos`
    );
    for (const p of problems) console.log(`        · ${p}`);
    for (const w of warnings) console.log(`        ! ${w}`);
    failures += problems.length;
  }

  await browser.close();
  console.log(
    failures ? `\n${failures} problema(s) geométrico(s).` : "\nGeometria limpa."
  );
  process.exit(failures ? 1 : 0);
};

run();
