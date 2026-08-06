/**
 * Os conteúdos das geometrias novas, repartidos entre as coleções:
 * eletrônica leva o ciclo (oscilador em anel), a escala (níveis lógicos) e
 * o explodido (MOSFET); o sāṃkhya leva o sankey (a contabilidade da
 * criação) e o venn (pramāṇas entre escolas) — ver flows/contagem.ts.
 */

import type { CycleSpec, ExplodedSpec, ScaleSpec } from "../viz/types";

const E = {
  entradaA: "#4ec9e6",
  entradaB: "#a68cf0",
  porta: "#e0a44e",
  saida: "#7ee787",
  falso: "#d9544d",
  verdade: "#56d364",
  nota: "#8aa79a",
};

/**
 * Três inversores em anel: número ímpar de negações fechadas sobre si não
 * tem estado estável — o anel oscila sozinho, e vira relógio.
 */
export const osciladorAnel: CycleSpec = {
  kind: "cycle",
  slug: "oscilador-anel",
  title: "oscilador em anel",
  script: "¬¬¬",
  subtitle:
    "Três inversores mordendo o próprio rabo: ímpar não tem paz, e vira relógio.",
  blurb:
    "Feche um número ímpar de NOTs em círculo e não existe estado estável: cada volta inverte o sinal, e a instabilidade vira frequência.",
  footer: [
    "f ≈ 1 / (2 · N · t_pd)",
    "Cada inversor atrasa t_pd; a volta completa inverte, então o período é duas voltas. É assim que se mede o atraso de porta de um processo — e é o coração de muitos relógios em chip.",
  ],
  center: {
    id: "anel",
    script: "∿",
    label: "sem repouso",
    gloss: "a instabilidade útil",
    detail:
      "Com número par de inversões o anel trava num estado estável e vira memória (o latch). Com ímpar, nenhuma atribuição satisfaz todas as portas ao mesmo tempo — a contradição corre em círculo na velocidade do silício.",
    accent: E.porta,
    round: true,
  },
  ring: [
    {
      id: "inv1",
      script: "¬",
      label: "inversor 1",
      gloss: "atrasa t_pd",
      accent: E.entradaA,
      variant: "compact",
    },
    {
      id: "inv2",
      script: "¬",
      label: "inversor 2",
      gloss: "atrasa t_pd",
      accent: E.entradaB,
      variant: "compact",
    },
    {
      id: "inv3",
      script: "¬",
      label: "inversor 3",
      gloss: "atrasa t_pd",
      accent: E.saida,
      variant: "compact",
    },
  ],
  edges: [
    { from: "inv1", to: "inv2", kind: "flow", accent: E.entradaA },
    { from: "inv2", to: "inv3", kind: "flow", accent: E.entradaB },
    { from: "inv3", to: "inv1", kind: "flow", accent: E.saida },
    {
      from: "anel",
      to: "inv1",
      kind: "illumine",
      accent: E.porta,
    },
  ],
};

/**
 * A régua de tensão que os cartões de entrada descrevem em prosa desde a
 * primeira porta: perto do terra é 0, perto da alimentação é 1, e o meio é
 * terra de ninguém. Valores da família TTL 5 V.
 */
export const niveisLogicos: ScaleSpec = {
  kind: "scale",
  slug: "niveis-logicos",
  title: "níveis lógicos",
  script: "0⋯1",
  subtitle:
    "A posição é o valor: onde na tensão mora o 0, onde mora o 1, e a terra de ninguém no meio.",
  blurb:
    "A régua de 0 a 5 V com as faixas garantidas e as quatro marcas de contrato — saída promete mais do que a entrada exige, e a diferença é a margem de ruído.",
  footer: [
    "margem de ruído = o que a saída promete além do que a entrada exige",
    "V_OL 0,4 < V_IL 0,8 e V_OH 2,4 > V_IH 2,0 (TTL): os 0,4 V de folga em cada lado são o que deixa um fio real — com ruído — ainda ser digital.",
  ],
  min: 0,
  max: 5,
  unit: " V",
  bands: [
    {
      from: 0,
      to: 0.8,
      label: "0 garantido",
      gloss: "qualquer entrada lê baixo",
      accent: "#4ec9e6",
    },
    {
      from: 0.8,
      to: 2.0,
      label: "indefinida",
      gloss: "terra de ninguém",
      detail:
        "Aqui a porta pode ler qualquer coisa. O circuito é desenhado para atravessar esta faixa depressa e nunca morar nela.",
      accent: "#d9544d",
    },
    {
      from: 2.0,
      to: 5,
      label: "1 garantido",
      gloss: "qualquer entrada lê alto",
      accent: "#56d364",
    },
  ],
  marks: [
    { at: 0.4, label: "V_OL", gloss: "saída 0: no máximo isto", side: "l", accent: "#4ec9e6" },
    { at: 2.4, label: "V_OH", gloss: "saída 1: no mínimo isto", side: "l", accent: "#56d364" },
    { at: 0.8, label: "V_IL", gloss: "entrada aceita 0 até aqui", side: "r", accent: "#4ec9e6" },
    { at: 2.0, label: "V_IH", gloss: "entrada aceita 1 daqui", side: "r", accent: "#56d364" },
  ],
};

/**
 * O nMOS em corte, camada por camada — a figura é grade (topologia), as
 * legendas ancoram por cor.
 */
export const mosfet: ExplodedSpec = {
  kind: "exploded",
  slug: "mosfet",
  title: "MOSFET",
  script: "⏛",
  subtitle:
    "A chave que tudo isto pressupõe, aberta em camadas: metal, óxido, semicondutor.",
  blurb:
    "Todas as portas do site são arranjos de chaves — e a chave é isto: um campo elétrico atravessando um isolante para criar um caminho onde não havia.",
  footer: [
    "metal · óxido · semicondutor — o nome é a seção transversal",
    "Tensão na porta não injeta corrente: atrai elétrons para debaixo do óxido e forma o canal. Controle por campo, não por contato — é por isso que a entrada de uma porta lógica quase não consome.",
  ],
  cols: 8,
  cells: [
    { id: "gate", label: "porta (G)", script: "G", accent: "#e0a44e", row: 1, colStart: 3, colEnd: 7 },
    { id: "oxido", label: "óxido", accent: "#8aa79a", row: 2, colStart: 3, colEnd: 7 },
    { id: "fonte", label: "fonte n+ (S)", script: "S", accent: "#4ec9e6", row: 3, colStart: 1, colEnd: 3 },
    { id: "canal", label: "canal", accent: "#56d364", row: 3, colStart: 3, colEnd: 7 },
    { id: "dreno", label: "dreno n+ (D)", script: "D", accent: "#a68cf0", row: 3, colStart: 7, colEnd: 9 },
    { id: "substrato", label: "substrato p", accent: "#3f6b55", row: 4, colStart: 1, colEnd: 9 },
  ],
  callouts: [
    {
      target: "gate",
      side: "r",
      label: "porta (gate)",
      gloss: "o eletrodo de controle",
      detail:
        "Tensão aqui cria o campo que governa o canal. Não toca o semicondutor: age através do óxido, à distância.",
    },
    {
      target: "oxido",
      side: "l",
      label: "óxido de porta",
      gloss: "o isolante que faz o M-O-S",
      detail:
        "Nanômetros de SiO₂. Fino o bastante para o campo atravessar, isolante o bastante para a corrente não — é o capacitor que faz a chave ser de campo.",
    },
    {
      target: "canal",
      side: "r",
      label: "canal",
      gloss: "o caminho que só existe convidado",
      detail:
        "Com a porta acima do limiar, elétrons atraídos invertem a superfície do substrato p e ligam fonte a dreno. Sem campo, não há caminho: a chave está aberta.",
    },
    {
      target: "fonte",
      side: "l",
      label: "fonte e dreno",
      gloss: "as duas pontas n+",
      detail:
        "Regiões fortemente dopadas: reservatórios de elétrons esperando o canal aparecer entre eles.",
    },
    {
      target: "substrato",
      side: "r",
      label: "substrato p",
      gloss: "o corpo",
      detail:
        "O silício de base, dopado ao contrário das pontas — é essa oposição que impede corrente sem canal.",
    },
  ],
};
