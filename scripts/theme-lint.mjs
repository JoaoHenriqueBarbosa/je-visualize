/**
 * Lint de completude de tema.
 *
 * A armadilha conhecida: a estrutura (pages.css, flow.css) consome variáveis
 * e cada tema precisa definir todas — variável faltando não dá erro, dá cor
 * herdada de fora ou transparente, e só o olho pega. O checklist era manual
 * na skill; este script o torna verificação.
 *
 * Regras:
 *   - `var(--x)` SEM fallback na estrutura é obrigação: todo tema que
 *     renderiza aquela estrutura precisa definir `--x` (ou globals.css).
 *   - `var(--x, fallback)` é opcional por construção.
 *   - Temas de coleção (referenciados por `theme:` em src/collections/*.ts)
 *     respondem por TODA a estrutura. Temas fora de coleção (theme-root)
 *     respondem só por pages.css — nunca renderizam canvas.
 *
 * A descoberta é por leitura dos fontes, sem cadastro: coleção nova com tema
 * novo entra na cobrança sozinha, igual à auditoria geométrica.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const read = (p) => readFileSync(p, "utf8");

/**
 * Variáveis que chegam inline pelo DADO do flow (style={{ "--x": ... }}),
 * não pelo tema — o accent é identidade do conceito e atravessa temas.
 * Lista explícita e curta de propósito: cada entrada aqui é uma decisão.
 */
const DATA_VARS = new Set(["--accent"]);

/** Variáveis exigidas (usadas sem fallback) num CSS de estrutura. */
const required = (css) => {
  const out = new Set();
  const re = /var\(\s*(--[\w-]+)\s*([,)])/g;
  for (const m of css.matchAll(re)) {
    if (m[2] === ")") out.add(m[1]);
  }
  return out;
};

/** Variáveis definidas (`--x:`) num arquivo. */
const defined = (css) => {
  const out = new Set();
  for (const m of css.matchAll(/(--[\w-]+)\s*:/g)) out.add(m[1]);
  return out;
};

// Estruturas e quem responde por elas.
const pagesCss = read("src/styles/pages.css");
const canvasCss = read("src/flow/flow.css");
// Estruturas de kinds futuros (records, scale...) entram em canvasCss.

const pagesVars = required(pagesCss);
const canvasVars = required(canvasCss);

// O que já vem resolvido de fora dos temas: tokens de tamanho de globals.css
// e variáveis que a própria estrutura define (ex.: --tool na .flow-page).
const globals = new Set([
  ...defined(read("src/styles/globals.css")),
  ...defined(pagesCss),
  ...defined(canvasCss),
]);

// Temas de coleção: os que alguma coleção declara em `theme:`.
const collectionThemes = new Set();
for (const f of readdirSync("src/collections")) {
  if (!f.endsWith(".ts")) continue;
  for (const m of read(join("src/collections", f)).matchAll(/theme:\s*"([\w-]+)"/g))
    collectionThemes.add(m[1]);
}

let failures = 0;

for (const f of readdirSync("src/styles/themes").sort()) {
  if (!f.endsWith(".css")) continue;
  const css = read(join("src/styles/themes", f));
  const themeClass = css.match(/\.(theme-[\w-]+)/)?.[1];
  if (!themeClass) continue;

  const isCollection = collectionThemes.has(themeClass);
  const owed = isCollection ? new Set([...pagesVars, ...canvasVars]) : pagesVars;
  const has = defined(css);

  const missing = [...owed]
    .filter((v) => !has.has(v) && !globals.has(v) && !DATA_VARS.has(v))
    .sort();
  const scope = isCollection ? "coleção" : "só páginas";
  if (missing.length) {
    console.log(`FALHA ${themeClass.padEnd(20)} (${scope})`);
    for (const v of missing) console.log(`        · falta ${v}`);
    failures += missing.length;
  } else {
    console.log(`ok    ${themeClass.padEnd(20)} (${scope})`);
  }
}

console.log(
  failures
    ? `\n${failures} variável(is) de tema faltando.`
    : `\nTemas completos.`
);
process.exit(failures ? 1 : 0);
