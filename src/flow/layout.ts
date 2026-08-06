/**
 * Motor de layout em múltiplas passadas.
 *
 * Nada aqui inventa tamanho. As medidas chegam prontas de `Measurer`, que
 * renderiza os nós e os rótulos com o CSS real e lê do DOM. O motor só
 * decide onde as coisas cabem, e a regra é sempre a mesma: um vão só existe
 * se alguém precisa dele, e tem exatamente o tamanho de quem o ocupa.
 *
 * Passadas:
 *   1. ordenação — camadas a partir das arestas de fluxo
 *   2. grade     — alturas de linha e larguras de coluna, das medidas reais
 *   3. vãos      — cada vão cresce até caber o maior rótulo que o atravessa
 *   4. molduras  — vãos nas bordas dos grupos crescem pelo padding do grupo,
 *                  o que é o que garante que a moldura contenha de fato
 *   5. posições  — soma acumulada; nós centrados na célula
 *   6. bordas    — retângulo do grupo pela união dos membros, e lados das
 *                  arestas derivados da geometria final
 */

/**
 * O motor de layout — sete passadas, todas sobre medidas reais.
 *
 * Entrada: o spec declarativo e as caixas medidas no DOM (Measurer). Saída:
 * retângulos absolutos para nós e molduras, e lados de âncora para as
 * arestas. O React Flow recebe tudo resolvido e não decide nada.
 *
 * As passadas, em ordem e por quê nesta ordem:
 *   1. ordem     — ranks derivados das arestas de fluxo; sem eles não há
 *                  linha nem coluna para nada.
 *   2. grade     — alturas de linha e larguras de coluna pelos máximos.
 *   3. vãos      — corredores entre linhas/colunas dimensionados pelos
 *                  rótulos que vão morar neles.
 *   4. molduras  — padding de grupo SOMADO aos vãos de borda; depois disso
 *                  os vãos não mudam mais.
 *   5. posições  — soma acumulada; primeiro momento com coordenada absoluta.
 *   6. molduras finais — derivadas dos membros posicionados (wrapGroups).
 *   7. compactação — recolhe a folga que a passada 2 cria quando um cartão
 *                  `full` infla uma coluna de `compact`s.
 *
 * Invariantes que a auditoria cobra e este arquivo promete:
 *   - nós nunca se sobrepõem;
 *   - moldura contém todos os seus membros e nenhum estranho;
 *   - rótulo de aresta tem corredor próprio, nunca fica sobre cartão.
 *
 * O que o motor NÃO promete: beleza. Topologia ruim (ramos irmãos
 * empilhados, colunas mal distribuídas) sai geometricamente válida e feia —
 * o conserto é no spec, e o olho no PNG é parte do processo.
 */

import type { EdgeSpec, FlowSpec, Rect, Side, Size } from "./types";
import { edgeKey } from "./types";

/** Vão mínimo entre camadas, mesmo sem rótulo. */
const GAP_Y = 56;
/** Vão mínimo entre colunas. */
const GAP_X = 52;
/** Folga em volta de um rótulo dentro do vão que o hospeda. */
const LABEL_AIR = 18;
/** Distância da moldura do grupo ao membro mais próximo. */
const GROUP_PAD = 30;
/** Espaço extra no topo da moldura para a legenda não colidir. */
const GROUP_LEGEND_AIR = 10;
/** Margem do canvas. */
const MARGIN = 48;

export interface LayoutInput {
  spec: FlowSpec;
  nodeSizes: Record<string, Size>;
  edgeLabelSizes: Record<string, Size>;
  groupLegendSizes: Record<string, Size>;
}

export interface PlacedEdge {
  spec: EdgeSpec;
  fromSide: Side;
  toSide: Side;
}

export interface LayoutResult {
  nodes: Record<string, Rect>;
  groups: Record<string, Rect>;
  edges: PlacedEdge[];
  bounds: Rect;
}

const kindOf = (e: EdgeSpec) => e.kind ?? "flow";

/**
 * Lados de âncora derivados da geometria FINAL: eixo dominante decide, o
 * autor pode forçar. Exportada porque todo posicionador termina aqui — o
 * polar (viz/layouts/polar.ts) deriva os lados exatamente como a grade.
 */
export const placeEdges = (
  spec: FlowSpec,
  nodes: Record<string, Rect>
): PlacedEdge[] =>
  spec.edges.map((e) => {
    const a = nodes[e.from];
    const b = nodes[e.to];
    let fromSide: Side;
    let toSide: Side;

    if (!a || !b) {
      fromSide = "b";
      toSide = "t";
    } else {
      const dx = b.x + b.w / 2 - (a.x + a.w / 2);
      const dy = b.y + b.h / 2 - (a.y + a.h / 2);
      if (Math.abs(dy) >= Math.abs(dx)) {
        fromSide = dy > 0 ? "b" : "t";
        toSide = dy > 0 ? "t" : "b";
      } else {
        fromSide = dx > 0 ? "r" : "l";
        toSide = dx > 0 ? "l" : "r";
      }
    }

    return {
      spec: e,
      fromSide: e.fromSide ?? fromSide,
      toSide: e.toSide ?? toSide,
    };
  });

export function layout(input: LayoutInput): LayoutResult {
  const { spec, nodeSizes, edgeLabelSizes, groupLegendSizes } = input;

  const fallback: Size = { w: 250, h: 120 };
  const sizeOf = (id: string) => nodeSizes[id] ?? fallback;

  // ---------------------------------------------------------------- 1. ordem
  // Relaxamento de caminho mais longo sobre as arestas de fluxo. Nós com
  // `rank` declarado ficam pinados: são fileiras de irmãos que o autor
  // posicionou de propósito.
  //
  // Só arestas `flow` participam: `aside` não avança camada por definição,
  // `feedback` criaria ciclo e travaria o relaxamento, `illumine` é
  // presença, não causa. Se um flow parecer "achatado", quase sempre é
  // aresta que devia ser `flow` declarada como outra coisa.
  const pinned = new Set(
    spec.nodes.filter((n) => n.rank !== undefined).map((n) => n.id)
  );
  const rank = new Map<string, number>(
    spec.nodes.map((n) => [n.id, n.rank ?? 0])
  );
  const flowEdges = spec.edges.filter((e) => kindOf(e) === "flow");

  for (let pass = 0; pass <= spec.nodes.length; pass++) {
    let moved = false;
    for (const e of flowEdges) {
      if (pinned.has(e.to)) continue;
      const from = rank.get(e.from);
      const to = rank.get(e.to);
      if (from === undefined || to === undefined) continue;
      if (to < from + 1) {
        rank.set(e.to, from + 1);
        moved = true;
      }
    }
    if (!moved) break;
  }

  const column = new Map<string, number>(
    spec.nodes.map((n) => [n.id, n.column ?? 0])
  );

  // Normaliza para índices começando em zero.
  const ranks = [...new Set(rank.values())].sort((a, b) => a - b);
  const cols = [...new Set(column.values())].sort((a, b) => a - b);
  const rIdx = new Map(ranks.map((r, i) => [r, i]));
  const cIdx = new Map(cols.map((c, i) => [c, i]));

  const rowOf = (id: string) => rIdx.get(rank.get(id) ?? 0) ?? 0;
  const colOf = (id: string) => cIdx.get(column.get(id) ?? 0) ?? 0;

  const nRows = ranks.length;
  const nCols = cols.length;

  // ---------------------------------------------------------------- 2. grade
  const rowH = new Array(nRows).fill(0);
  const colW = new Array(nCols).fill(0);
  for (const n of spec.nodes) {
    const s = sizeOf(n.id);
    rowH[rowOf(n.id)] = Math.max(rowH[rowOf(n.id)], s.h);
    colW[colOf(n.id)] = Math.max(colW[colOf(n.id)], s.w);
  }

  // ----------------------------------------------------------------- 3. vãos
  const gapY = new Array(Math.max(0, nRows - 1)).fill(GAP_Y);
  const gapX = new Array(Math.max(0, nCols - 1)).fill(GAP_X);

  for (const e of spec.edges) {
    const label = edgeLabelSizes[edgeKey(e)];
    if (!label) continue;

    const r0 = rowOf(e.from);
    const r1 = rowOf(e.to);
    const c0 = colOf(e.from);
    const c1 = colOf(e.to);

    // Rótulo de aresta vertical mora no vão entre as duas camadas.
    if (r0 !== r1) {
      const lo = Math.min(r0, r1);
      const hi = Math.max(r0, r1);
      if (hi - lo === 1) {
        gapY[lo] = Math.max(gapY[lo], label.h + LABEL_AIR * 2);
      }
    }

    // Rótulo com componente horizontal mora no corredor entre colunas.
    if (c0 !== c1) {
      const lo = Math.min(c0, c1);
      const hi = Math.max(c0, c1);
      // Um rótulo que cruza N corredores pode se espalhar por eles: cada
      // corredor reserva a sua fração. A contrapartida mora na passada 7 —
      // como a reserva é fracionada, a compactação precisa reavaliar o vão
      // INTEIRO de cada rótulo antes de encolher qualquer fronteira, senão
      // espreme a peça única contra os cartões (aconteceu; a auditoria
      // reprovou três flows e a restrição extra entrou lá).
      const share = (label.w + LABEL_AIR * 2) / (hi - lo);
      for (let c = lo; c < hi; c++) gapX[c] = Math.max(gapX[c], share);
    }
  }

  // ------------------------------------------------------------- 4. molduras
  // O padding do grupo é *somado* ao vão da borda, nunca disputado com o
  // rótulo que já mora lá. É isso que faz a moldura conter de verdade em vez
  // de passar por cima do vizinho.
  let padTop = MARGIN;
  let padBottom = MARGIN;
  let padLeft = MARGIN;
  let padRight = MARGIN;

  const groupRows = new Map<string, [number, number]>();
  const groupCols = new Map<string, [number, number]>();

  for (const g of spec.groups ?? []) {
    const members = spec.nodes.filter((n) => n.group === g.id);
    if (!members.length) continue;

    const rs = members.map((m) => rowOf(m.id));
    const cs = members.map((m) => colOf(m.id));
    const r0 = Math.min(...rs);
    const r1 = Math.max(...rs);
    const c0 = Math.min(...cs);
    const c1 = Math.max(...cs);
    groupRows.set(g.id, [r0, r1]);
    groupCols.set(g.id, [c0, c1]);

    // Um grupo ocupa um bloco retangular da grade. Se um nó de fora cai
    // dentro desse bloco, a moldura vai passar por cima dele e não há
    // padding que resolva — o problema é topológico, não métrico.
    const intruso = spec.nodes.find(
      (n) =>
        n.group !== g.id &&
        rowOf(n.id) >= r0 &&
        rowOf(n.id) <= r1 &&
        colOf(n.id) >= c0 &&
        colOf(n.id) <= c1
    );
    if (intruso) {
      console.warn(
        `[layout] "${intruso.id}" cai dentro do bloco do grupo "${g.id}" sem ser membro. ` +
          `Mova-o de coluna/camada ou inclua-o no grupo.`
      );
    }

    const legend = groupLegendSizes[g.id] ?? { w: 0, h: 18 };
    const topNeed = GROUP_PAD + legend.h / 2 + GROUP_LEGEND_AIR;

    if (r0 > 0) gapY[r0 - 1] += topNeed;
    else padTop += topNeed;

    if (r1 < nRows - 1) gapY[r1] += GROUP_PAD;
    else padBottom += GROUP_PAD;

    if (c0 > 0) gapX[c0 - 1] += GROUP_PAD;
    else padLeft += GROUP_PAD;

    if (c1 < nCols - 1) gapX[c1] += GROUP_PAD;
    else padRight += GROUP_PAD;
  }

  // ------------------------------------------------------------- 5. posições
  const rowTop = new Array(nRows).fill(0);
  let y = padTop;
  for (let r = 0; r < nRows; r++) {
    rowTop[r] = y;
    y += rowH[r] + (r < nRows - 1 ? gapY[r] : 0);
  }
  const contentH = y + padBottom;

  const colLeft = new Array(nCols).fill(0);
  let x = padLeft;
  for (let c = 0; c < nCols; c++) {
    colLeft[c] = x;
    x += colW[c] + (c < nCols - 1 ? gapX[c] : 0);
  }

  const nodes: Record<string, Rect> = {};
  for (const n of spec.nodes) {
    const s = sizeOf(n.id);
    const r = rowOf(n.id);
    const c = colOf(n.id);
    nodes[n.id] = {
      x: Math.round(colLeft[c] + (colW[c] - s.w) / 2),
      y: Math.round(rowTop[r] + (rowH[r] - s.h) / 2),
      w: s.w,
      h: s.h,
    };
  }

  // ------------------------------------------------------- 6. molduras finais
  // Envolve os membros já posicionados. Chamada de novo depois da compactação,
  // porque a moldura é sempre derivada — nunca uma caixa com vida própria.
  const wrapGroups = (): Record<string, Rect> => {
    const out: Record<string, Rect> = {};
    for (const g of spec.groups ?? []) {
      const members = spec.nodes.filter((n) => n.group === g.id);
      if (!members.length) continue;
      const rects = members.map((m) => nodes[m.id]);
      const x0 = Math.min(...rects.map((r) => r.x)) - GROUP_PAD;
      const y0 = Math.min(...rects.map((r) => r.y)) - GROUP_PAD;
      const x1 = Math.max(...rects.map((r) => r.x + r.w)) + GROUP_PAD;
      const y1 = Math.max(...rects.map((r) => r.y + r.h)) + GROUP_PAD;
      out[g.id] = {
        x: Math.round(x0),
        y: Math.round(y0),
        w: Math.round(x1 - x0),
        h: Math.round(y1 - y0),
      };
    }
    return out;
  };

  // -------------------------------------------------- 7. compactação lateral
  // A largura de coluna é o máximo global da coluna, então um cartão `full`
  // numa camada infla a coluna inteira e os `compact` de outras camadas ficam
  // centrados em sobra. Aqui essa sobra é recolhida: para cada fronteira entre
  // colunas, mede-se a folga real entre o que está à esquerda e o que está à
  // direita — contando só pares que de fato se cruzam na vertical — e o bloco
  // à direita desliza para dentro dessa folga.
  //
  // O corredor reservado em `gapX` é o piso e nunca é invadido: é lá que moram
  // os rótulos de aresta e o padding das molduras. A ordem das colunas e o
  // alinhamento vertical dentro de cada coluna ficam intactos, porque a coluna
  // inteira desliza junto.
  const overlapY = (a: Rect, b: Rect) =>
    a.y < b.y + b.h && b.y < a.y + a.h;

  for (let c = 0; c < nCols - 1; c++) {
    type Obstacle = { rect: Rect; minCol: number; maxCol: number };
    const obstacles: Obstacle[] = spec.nodes.map((n) => ({
      rect: nodes[n.id],
      minCol: colOf(n.id),
      maxCol: colOf(n.id),
    }));
    for (const [id, rect] of Object.entries(wrapGroups())) {
      const cols = groupCols.get(id);
      if (cols) obstacles.push({ rect, minCol: cols[0], maxCol: cols[1] });
    }

    const left = obstacles.filter((o) => o.maxCol <= c);
    const right = obstacles.filter((o) => o.minCol >= c + 1);
    if (!left.length || !right.length) continue;

    const required = gapX[c];
    let slack = Infinity;
    for (const l of left) {
      for (const r of right) {
        if (!overlapY(l.rect, r.rect)) continue;
        slack = Math.min(slack, r.rect.x - (l.rect.x + l.rect.w) - required);
      }
    }

    // Nenhum par se cruza na vertical: nada colide de fato nessa fronteira,
    // então a folga é a distância entre as extremidades ocupadas.
    if (!Number.isFinite(slack)) {
      const edgeL = Math.max(...left.map((o) => o.rect.x + o.rect.w));
      const edgeR = Math.min(...right.map((o) => o.rect.x));
      slack = edgeR - edgeL - required;
    }

    // Um rótulo horizontal é uma peça só e pode atravessar várias fronteiras.
    // O corredor foi reservado fronteira a fronteira, mas quem precisa caber é
    // o vão inteiro entre as duas pontas: encolher qualquer trecho do caminho
    // espreme o rótulo contra os cartões. Por isso a folga é limitada também
    // pela distância que cada rótulo em travessia ainda precisa manter.
    for (const e of spec.edges) {
      const label = edgeLabelSizes[edgeKey(e)];
      if (!label) continue;
      const c0 = colOf(e.from);
      const c1 = colOf(e.to);
      if (c0 === c1) continue;
      if (c < Math.min(c0, c1) || c >= Math.max(c0, c1)) continue;

      const a = nodes[e.from];
      const b = nodes[e.to];
      if (!a || !b) continue;
      const near = a.x < b.x ? a : b;
      const far = a.x < b.x ? b : a;
      const span = far.x - (near.x + near.w);
      slack = Math.min(slack, span - (label.w + LABEL_AIR * 2));
    }

    const shift = Math.floor(Math.max(0, slack));
    if (shift === 0) continue;

    for (let k = c + 1; k < nCols; k++) colLeft[k] -= shift;
    for (const n of spec.nodes) {
      if (colOf(n.id) >= c + 1) nodes[n.id].x -= shift;
    }
  }

  const groups = wrapGroups();

  const occupied = [
    ...Object.values(nodes),
    ...Object.values(groups),
  ];
  const contentW = occupied.length
    ? Math.max(...occupied.map((r) => r.x + r.w)) + padRight
    : padLeft + padRight;

  const edges = placeEdges(spec, nodes);

  return {
    nodes,
    groups,
    edges,
    bounds: { x: 0, y: 0, w: Math.round(contentW), h: Math.round(contentH) },
  };
}
