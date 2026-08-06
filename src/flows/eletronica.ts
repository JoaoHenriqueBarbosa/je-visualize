import type { FlowSpec, NodeSpec } from "../flow/types";

const E = {
  entrada: "#5f9c7b",
  porta: "#8fe0b0",
  saida: "#d6f5e3",
  falso: "#3f6b55",
  verdade: "#8fe0b0",
  nota: "#4f7f68",
};

/** As quatro linhas da tabela, como fileira de irmãos no rank indicado. */
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
    };
  });

const entradas: NodeSpec[] = [
  {
    id: "a",
    script: "A",
    label: "entrada A",
    gloss: "0 ou 1",
    detail:
      "Um nível de tensão lido como um de dois estados. Perto do terra é 0, perto da alimentação é 1; a faixa do meio é indefinida e o circuito é desenhado para não ficar nela.",
    accent: E.entrada,
    rank: 0,
    column: -1,
  },
  {
    id: "b",
    script: "B",
    label: "entrada B",
    gloss: "0 ou 1",
    detail:
      "A segunda entrada, independente da primeira. Duas entradas binárias dão quatro combinações — e é por isso que a tabela verdade de uma porta de duas entradas tem sempre quatro linhas.",
    accent: E.entrada,
    rank: 0,
    column: 1,
  },
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
  groups: [
    {
      id: "tabela",
      label: "tabela verdade",
      sub: "as quatro combinações possíveis",
    },
  ],
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
    { from: "a", to: "porta", kind: "flow", accent: E.entrada },
    { from: "b", to: "porta", kind: "flow", accent: E.entrada },
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
  groups: [
    {
      id: "tabela",
      label: "tabela verdade",
      sub: "as quatro combinações possíveis",
    },
  ],
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
    { from: "a", to: "porta", kind: "flow", accent: E.entrada },
    { from: "b", to: "porta", kind: "flow", accent: E.entrada },
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
