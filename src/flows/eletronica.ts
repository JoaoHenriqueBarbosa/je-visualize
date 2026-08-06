/**
 * As portas lógicas — seis flows deliberadamente o MESMO desenho.
 *
 * Entradas, porta, saída, nota física à direita, tabela verdade embaixo:
 * a estrutura idêntica é o argumento, porque a diferença entre as portas
 * não está na forma do diagrama e sim no conteúdo — série vs paralelo vs
 * derivação, onde mora o único 1 ou o único 0. Quem abre duas lado a lado
 * vê isso sem que nenhum texto precise dizer.
 *
 * As entradas A e B são compartilhadas via spread (`...entradas`) para que
 * essa igualdade não dependa de disciplina: é o mesmo objeto.
 *
 * Todos os flows são simulados: A e B são `input`, porta e saída têm
 * `compute`, e cada linha da tabela verdade declara `activeWhen` — a linha
 * viva. A lógica mora aqui porque é dado do assunto, como os accents.
 */

import type { FlowSpec, NodeSpec, SimValue } from "../flow/types";
import type { CompareSpec } from "../viz/types";

/**
 * Cor por função, e não por decoração — mesma regra da paleta do sāṃkhya:
 * o accent é identidade do papel que a peça cumpre e vale em todos os
 * diagramas.
 *
 * A e B têm cores diferentes de propósito. São sinais independentes, e a
 * primeira versão desta coleção pintava tudo do mesmo verde — o desenho dizia
 * "isto é tudo a mesma coisa" justo onde a independência das entradas é o que
 * gera as quatro linhas da tabela. A porta é o cobre da trilha, a saída é o
 * LED que acende, e conduz/não conduz usa a única distinção que uma bancada
 * faz sem precisar pensar.
 */
const E = {
  entradaA: "#4ec9e6",
  entradaB: "#a68cf0",
  porta: "#e0a44e",
  saida: "#7ee787",
  falso: "#d9544d",
  verdade: "#56d364",
  nota: "#8aa79a",
};

type V = Record<string, SimValue>;
const bit = (x: SimValue) => (x ? 1 : 0);

/** As quatro linhas da tabela, fileira de irmãos, cada uma sabendo quando é ela. */
const tabela = (
  rank: number,
  op: string,
  resultados: [number, number, number, number]
): NodeSpec[] =>
  ([
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ] as [number, number][]).map(([a, b], i) => {
    const r = resultados[i];
    return {
      id: `t${a}${b}`,
      script: `${a} ${op} ${b}`,
      label: String(r),
      gloss: r ? "conduz" : "não conduz",
      accent: r ? E.verdade : E.falso,
      variant: "compact" as const,
      rank,
      column: i - 2,
      group: "tabela",
      activeWhen: (v: V) => v.a === a && v.b === b,
    };
  });

const grupoTabela = {
  id: "tabela",
  label: "tabela verdade",
  sub: "as quatro combinações possíveis",
};

const entradas: NodeSpec[] = [
  {
    id: "a",
    script: "A",
    label: "entrada A",
    gloss: "0 ou 1 — clique",
    detail:
      "Um nível de tensão lido como um de dois estados. Perto do terra é 0, perto da alimentação é 1; a faixa do meio é indefinida e o circuito é desenhado para não ficar nela.",
    accent: E.entradaA,
    rank: 0,
    column: -1,
    input: { initial: 0 },
  },
  {
    id: "b",
    script: "B",
    label: "entrada B",
    gloss: "0 ou 1 — clique",
    detail:
      "A segunda entrada, independente da primeira. Duas entradas binárias dão quatro combinações — e é por isso que a tabela verdade de uma porta de duas entradas tem sempre quatro linhas.",
    accent: E.entradaB,
    rank: 0,
    column: 1,
    input: { initial: 0 },
  },
];

const arestasDeEntrada = [
  { from: "a", to: "porta", kind: "flow" as const, accent: E.entradaA },
  { from: "b", to: "porta", kind: "flow" as const, accent: E.entradaB },
];

export const portaAnd: FlowSpec = {
  slug: "porta-and",
  title: "porta AND",
  script: "A ∧ B",
  subtitle:
    "Conduz só quando as duas entradas conduzem. O caminho é único e passa pelas duas.",
  blurb:
    "Duas chaves em série: a corrente só chega ao fim se ambas estiverem fechadas. Quatro combinações, um único 1.",
  footer: [
    "A ∧ B = 1 apenas quando A = 1 e B = 1",
    "Elemento neutro 1, elemento absorvente 0: qualquer entrada em 0 decide a saída sozinha.",
  ],
  groups: [grupoTabela],
  nodes: [
    ...entradas,
    {
      id: "porta",
      script: "∧",
      label: "AND",
      gloss: "conjunção",
      detail:
        "Fisicamente, duas chaves em série. A corrente precisa atravessar as duas para chegar ao outro lado, então qualquer uma aberta já interrompe o caminho — não há rota alternativa.",
      accent: E.porta,
      rank: 1,
      column: 0,
      compute: (v) => bit(v.a && v.b),
    },
    {
      id: "saida",
      script: "S",
      label: "saída",
      gloss: "1 em uma das quatro",
      detail:
        "Dos quatro casos possíveis, só um produz 1. É a porta que responde à pergunta 'as duas coisas ao mesmo tempo?' — e por isso serve de filtro: manter um sinal e zerá-lo por outro.",
      accent: E.saida,
      rank: 2,
      column: 0,
      compute: (v) => bit(v.porta),
    },
    {
      id: "serie",
      script: "⎓",
      label: "chaves em série",
      gloss: "a leitura física",
      detail:
        "Um caminho só, com dois obstáculos. Trocar série por paralelo neste mesmo desenho é exatamente o que transforma esta porta na outra.",
      accent: E.nota,
      variant: "compact",
      rank: 1,
      column: 3,
    },
    ...tabela(3, "∧", [0, 0, 0, 1]),
  ],
  edges: [
    ...arestasDeEntrada,
    {
      from: "porta",
      to: "saida",
      kind: "flow",
      label: "1 só se as duas",
      accent: E.porta,
    },
    { from: "porta", to: "serie", kind: "aside", accent: E.nota },
  ],
};

export const portaOr: FlowSpec = {
  slug: "porta-or",
  title: "porta OR",
  script: "A ∨ B",
  subtitle:
    "Conduz quando qualquer entrada conduz. Há dois caminhos, e basta um estar aberto.",
  blurb:
    "Duas chaves em paralelo: a corrente chega ao fim por qualquer das duas. Quatro combinações, um único 0.",
  footer: [
    "A ∨ B = 0 apenas quando A = 0 e B = 0",
    "Espelho exato da AND: elemento neutro 0, absorvente 1. Trocar série por paralelo troca uma pela outra.",
  ],
  groups: [grupoTabela],
  nodes: [
    ...entradas,
    {
      id: "porta",
      script: "∨",
      label: "OR",
      gloss: "disjunção",
      detail:
        "Duas chaves em paralelo. Existem dois caminhos independentes até o outro lado, então fechar qualquer um já basta — e fechar os dois não adianta mais nada.",
      accent: E.porta,
      rank: 1,
      column: 0,
      compute: (v) => bit(v.a || v.b),
    },
    {
      id: "saida",
      script: "S",
      label: "saída",
      gloss: "0 em uma das quatro",
      detail:
        "O inverso da AND na contagem: três casos dão 1 e só um dá 0. Responde 'pelo menos uma?' — serve para juntar sinais, onde qualquer um deles deve acionar o mesmo resultado.",
      accent: E.saida,
      rank: 2,
      column: 0,
      compute: (v) => bit(v.porta),
    },
    {
      id: "paralelo",
      script: "⑃",
      label: "chaves em paralelo",
      gloss: "a leitura física",
      detail:
        "Dois caminhos, um obstáculo em cada. É a mesma matéria da AND com a topologia trocada — a lógica muda porque o circuito mudou de forma, não de peça.",
      accent: E.nota,
      variant: "compact",
      rank: 1,
      column: 3,
    },
    ...tabela(3, "∨", [0, 1, 1, 1]),
  ],
  edges: [
    ...arestasDeEntrada,
    {
      from: "porta",
      to: "saida",
      kind: "flow",
      label: "1 se qualquer uma",
      accent: E.porta,
    },
    { from: "porta", to: "paralelo", kind: "aside", accent: E.nota },
  ],
};

export const portaNot: FlowSpec = {
  slug: "porta-not",
  title: "porta NOT",
  script: "¬A",
  subtitle:
    "Conduz quando a entrada não conduz. A única porta de uma entrada só.",
  blurb:
    "Uma chave em derivação: fechada, derruba a saída; aberta, deixa-a subir. Duas combinações, sempre o contrário.",
  footer: [
    "¬A inverte: 0 ↔ 1",
    "Involução: aplicar duas vezes devolve a entrada. Com série, paralelo e ela, escreve-se qualquer função lógica.",
  ],
  groups: [
    {
      id: "tabela",
      label: "tabela verdade",
      sub: "as duas combinações possíveis",
    },
  ],
  nodes: [
    {
      id: "a",
      script: "A",
      label: "entrada A",
      gloss: "0 ou 1 — clique",
      detail:
        "Uma entrada só: duas combinações. É a porta inteira com o menor domínio possível — e ainda assim indispensável, porque série e paralelo sozinhos nunca produzem um 'não'.",
      accent: E.entradaA,
      rank: 0,
      column: 0,
      input: { initial: 0 },
    },
    {
      id: "porta",
      script: "¬",
      label: "NOT",
      gloss: "negação",
      detail:
        "Fisicamente, uma chave em derivação para o terra. Entrada 1 fecha a chave e a saída cai; entrada 0 abre e a saída sobe pelo resistor. Inverter é a operação mais barata do circuito.",
      accent: E.porta,
      rank: 1,
      column: 0,
      compute: (v) => bit(!v.a),
    },
    {
      id: "saida",
      script: "S",
      label: "saída",
      gloss: "sempre o contrário",
      detail:
        "Duas combinações, saída sempre oposta. Sozinha não computa muito — mas fecha a base: com AND, OR e NOT se escreve qualquer função lógica, e sem NOT nenhuma das outras a alcança.",
      accent: E.saida,
      rank: 2,
      column: 0,
      compute: (v) => bit(v.porta),
    },
    {
      id: "derivacao",
      script: "⏚",
      label: "chave em derivação",
      gloss: "a leitura física",
      detail:
        "O obstáculo não está no caminho: está num desvio para o terra. Fechá-lo rouba a corrente da saída — a porta responde ao contrário do gesto, e é disso que ela vive.",
      accent: E.nota,
      variant: "compact",
      rank: 1,
      column: 3,
    },
    {
      id: "t0",
      script: "¬ 0",
      label: "1",
      gloss: "conduz",
      accent: E.verdade,
      variant: "compact",
      rank: 3,
      column: -1,
      group: "tabela",
      activeWhen: (v) => v.a === 0,
    },
    {
      id: "t1",
      script: "¬ 1",
      label: "0",
      gloss: "não conduz",
      accent: E.falso,
      variant: "compact",
      rank: 3,
      column: 0,
      group: "tabela",
      activeWhen: (v) => v.a === 1,
    },
  ],
  edges: [
    { from: "a", to: "porta", kind: "flow", accent: E.entradaA },
    {
      from: "porta",
      to: "saida",
      kind: "flow",
      label: "inverte",
      accent: E.porta,
    },
    { from: "porta", to: "derivacao", kind: "aside", accent: E.nota },
  ],
};

export const portaNand: FlowSpec = {
  slug: "porta-nand",
  title: "porta NAND",
  script: "A ⊼ B",
  subtitle: "O contrário da AND: só desliga quando as duas ligam.",
  blurb:
    "Série com inversor embutido. Quatro combinações, um único 0 — e de NANDs se constrói qualquer circuito.",
  footer: [
    "A ⊼ B = ¬(A ∧ B) — 0 apenas quando A = 1 e B = 1",
    "Universal: qualquer porta se monta só com NANDs, e é por isso que ela é o tijolo padrão do silício.",
  ],
  groups: [grupoTabela],
  nodes: [
    ...entradas,
    {
      id: "porta",
      script: "⊼",
      label: "NAND",
      gloss: "não-e",
      detail:
        "Duas chaves em série puxando a saída para o terra: só quando as duas fecham a saída cai. É a AND vista do outro lado do resistor — e a forma natural do CMOS, onde a versão invertida custa menos transistores que a direta.",
      accent: E.porta,
      rank: 1,
      column: 0,
      compute: (v) => bit(!(v.a && v.b)),
    },
    {
      id: "saida",
      script: "S",
      label: "saída",
      gloss: "0 em uma das quatro",
      detail:
        "Três casos dão 1, um dá 0 — a contagem da AND invertida. A universalidade vem daí: o 'não' já vem de brinde, e ligando NANDs entre si nascem NOT, AND e OR.",
      accent: E.saida,
      rank: 2,
      column: 0,
      compute: (v) => bit(v.porta),
    },
    {
      id: "serie-inversa",
      script: "¬⎓",
      label: "série invertida",
      gloss: "a leitura física",
      detail:
        "As mesmas duas chaves em série da AND, mas no ramo de descida: conduzir ali derruba a saída em vez de erguê-la. Inverter é mudar de ramo, não acrescentar peça.",
      accent: E.nota,
      variant: "compact",
      rank: 1,
      column: 3,
    },
    ...tabela(3, "⊼", [1, 1, 1, 0]),
  ],
  edges: [
    ...arestasDeEntrada,
    {
      from: "porta",
      to: "saida",
      kind: "flow",
      label: "0 só se as duas",
      accent: E.porta,
    },
    { from: "porta", to: "serie-inversa", kind: "aside", accent: E.nota },
  ],
};

export const portaNor: FlowSpec = {
  slug: "porta-nor",
  title: "porta NOR",
  script: "A ⊽ B",
  subtitle: "O contrário da OR: só liga quando as duas desligam.",
  blurb:
    "Paralelo com inversor embutido. Quatro combinações, um único 1 — a outra porta universal.",
  footer: [
    "A ⊽ B = ¬(A ∨ B) — 1 apenas quando A = 0 e B = 0",
    "Tão universal quanto a NAND, pelo mesmo argumento. O computador de bordo da Apollo foi construído inteiro de NOR.",
  ],
  groups: [grupoTabela],
  nodes: [
    ...entradas,
    {
      id: "porta",
      script: "⊽",
      label: "NOR",
      gloss: "não-ou",
      detail:
        "Duas chaves em paralelo puxando a saída para o terra: qualquer uma fechada já derruba. O espelho exato da NAND — série e paralelo trocados, como sempre nesta coleção.",
      accent: E.porta,
      rank: 1,
      column: 0,
      compute: (v) => bit(!(v.a || v.b)),
    },
    {
      id: "saida",
      script: "S",
      label: "saída",
      gloss: "1 em uma das quatro",
      detail:
        "Só o caso 0,0 produz 1: a porta que responde 'nenhuma das duas?'. Da dupla de universais, foi a escolhida quando o transistor era caro e a confiabilidade valia mais que a elegância.",
      accent: E.saida,
      rank: 2,
      column: 0,
      compute: (v) => bit(v.porta),
    },
    {
      id: "paralelo-inverso",
      script: "¬⑃",
      label: "paralelo invertido",
      gloss: "a leitura física",
      detail:
        "Os dois caminhos da OR, mas descendo: qualquer chave fechada rouba a corrente da saída. De novo, inverter é questão de onde o ramo aponta.",
      accent: E.nota,
      variant: "compact",
      rank: 1,
      column: 3,
    },
    ...tabela(3, "⊽", [1, 0, 0, 0]),
  ],
  edges: [
    ...arestasDeEntrada,
    {
      from: "porta",
      to: "saida",
      kind: "flow",
      label: "1 só se nenhuma",
      accent: E.porta,
    },
    { from: "porta", to: "paralelo-inverso", kind: "aside", accent: E.nota },
  ],
};

/**
 * O argumento da coleção tornado literal: os dois flows sempre foram o mesmo
 * desenho, e aqui dividem até as entradas — alternar A alterna nos dois.
 * O que resta de diferente é exatamente o assunto: série vs paralelo.
 */
export const serieVsParalelo: CompareSpec = {
  kind: "compare",
  slug: "serie-vs-paralelo",
  title: "série ‖ paralelo",
  script: "∧‖∨",
  subtitle:
    "As mesmas entradas atravessando as duas formas mínimas. Alterne e veja onde elas discordam.",
  blurb:
    "AND e OR lado a lado, com os mesmos controles: a diferença entre as portas fica sendo a única coisa que muda na tela.",
  footer: [
    "uma entrada, dois destinos",
    "Concordam em 0,0 e em 1,1. Discordam exatamente quando uma só conduz: a série ainda não fechou, o paralelo já fechou.",
  ],
  sides: [portaAnd, portaOr],
};

export const osciloscopio: FlowSpec = {
  slug: "osciloscopio",
  title: "osciloscópio",
  script: "∿",
  subtitle:
    "O tempo entra no diagrama: cada alternância vira um degrau nas ondas.",
  blurb:
    "Uma porta sob teste e dois instrumentos: um escreve o que você faz, o outro varre as quatro combinações de uma vez.",
  footer: [
    "a mesma porta, dois olhares: o gesto e o mapa",
    "O osciloscópio mostra a história que você produziu; a varredura mostra todas as histórias possíveis. A tabela verdade é uma onda dobrada.",
  ],
  nodes: [
    // As mesmas entradas das portas, mas nas colunas dos instrumentos: cada
    // fronteira de coluna precisa de um par que se cruze na vertical (o trio
    // do rank 1), senão a compactação recolhe o eixo — foi o que aconteceu
    // com o diamante em cinco colunas.
    { ...entradas[0], column: -2 },
    { ...entradas[1], column: 2 },
    {
      id: "s",
      script: "∧",
      label: "porta sob teste",
      gloss: "S = A ∧ B",
      detail:
        "Uma AND servindo de objeto de medida. Qualquer porta serviria — o que muda nas ondas é onde o degrau de S aparece, e é exatamente isso que o instrumento existe para mostrar.",
      accent: E.porta,
      rank: 1,
      column: 0,
      compute: (v) => bit(v.a && v.b),
    },
    {
      id: "scope",
      script: "∿",
      label: "osciloscópio",
      gloss: "escreve o que você faz",
      accent: E.saida,
      // Mesmo rank da porta, flanqueando: instrumentos abaixo deixavam a
      // coluna 0 sem vizinho vertical e a compactação recolhia o eixo.
      rank: 1,
      column: -2,
      chart: {
        type: "wave",
        watch: [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
          { id: "s", label: "S" },
        ],
      },
    },
    {
      id: "varredura",
      script: "⊞",
      label: "varredura",
      gloss: "as quatro combinações",
      accent: E.nota,
      rank: 1,
      column: 2,
      chart: {
        type: "wave",
        watch: [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
          { id: "s", label: "S" },
        ],
        sweep: [
          { a: 0, b: 0 },
          { a: 0, b: 1 },
          { a: 1, b: 0 },
          { a: 1, b: 1 },
        ],
      },
    },
  ],
  edges: [
    ...arestasDeEntrada,
    {
      from: "s",
      to: "scope",
      kind: "flow",
      label: "sonda",
      accent: E.saida,
    },
    { from: "s", to: "varredura", kind: "aside", accent: E.nota },
  ],
};

export const portaXor: FlowSpec = {
  slug: "porta-xor",
  title: "porta XOR",
  script: "A ⊕ B",
  subtitle: "Conduz quando as entradas discordam.",
  blurb:
    "Duas chaves de escada: mudar qualquer uma inverte a saída. Quatro combinações, dois 1s.",
  footer: [
    "A ⊕ B = 1 exatamente quando A ≠ B",
    "É a soma módulo 2: base do meio-somador e da paridade. A ⊕ A = 0 — aplicar duas vezes com a mesma chave desfaz, e é assim que cifras de fluxo a usam.",
  ],
  groups: [grupoTabela],
  nodes: [
    ...entradas,
    {
      id: "porta",
      script: "⊕",
      label: "XOR",
      gloss: "ou exclusivo",
      detail:
        "Duas chaves de escada: cada entrada escolhe um de dois caminhos, e os caminhos se cruzam. A corrente só completa o circuito quando as chaves apontam para lados diferentes.",
      accent: E.porta,
      rank: 1,
      column: 0,
      compute: (v) => bit(v.a !== v.b),
    },
    {
      id: "saida",
      script: "S",
      label: "saída",
      gloss: "1 quando diferem",
      detail:
        "Dois casos de cada lado — a única porta desta coleção que não tem elemento absorvente: nenhuma entrada decide sozinha. Responde 'são diferentes?', e por isso é o detector de mudança: soma sem vai-um, paridade, alternância.",
      accent: E.saida,
      rank: 2,
      column: 0,
      compute: (v) => bit(v.porta),
    },
    {
      id: "escada",
      script: "⇄",
      label: "chaves de escada",
      gloss: "a leitura física",
      detail:
        "O circuito do interruptor de escada: dois caminhos cruzados, uma chave em cada ponta. É a única destas leituras em que as duas chaves são iguais e nenhuma manda — só o desacordo conduz.",
      accent: E.nota,
      variant: "compact",
      rank: 1,
      column: 3,
    },
    ...tabela(3, "⊕", [0, 1, 1, 0]),
  ],
  edges: [
    ...arestasDeEntrada,
    {
      from: "porta",
      to: "saida",
      kind: "flow",
      label: "1 se diferentes",
      accent: E.porta,
    },
    { from: "porta", to: "escada", kind: "aside", accent: E.nota },
  ],
};
