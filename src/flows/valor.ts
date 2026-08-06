/**
 * A teoria do valor de Marx — o flow mais denso do site, e de propósito:
 * usa tudo o que a máquina sabe fazer. Simulação (jornada e trabalho
 * necessário clicáveis; mais-trabalho, taxa e valor total recalculam),
 * tabela viva (as três leituras da taxa acendem conforme a jornada que o
 * leitor montar), passeio narrado (o desdobramento d'O Capital em sete
 * passos, da mercadoria à taxa) e grupos (a dupla natureza, a jornada, as
 * leituras).
 *
 * As grandezas são horas, como no livro: o dinheiro só traduz. Os números
 * default (c=4, v=4, jornada=8) dão taxa de 100% — o exemplo do próprio
 * Marx no capítulo da taxa de mais-valia.
 *
 * A paleta é dado, como sempre: verde para o útil, azul para o valor, ouro
 * para o dinheiro, vinho para o capital, terracota para o trabalho vivo e
 * o carmim para a mais-valia — o vermelho fica com o que é dele.
 */

import type { FlowSpec, SimValue } from "../flow/types";

/** A paleta da economia — compartilhada pelas três visualizações do valor. */
export const V = {
  uso: "#4a7c59",
  valor: "#2d5e8a",
  dinheiro: "#a8842c",
  capital: "#7b1e26",
  trabalho: "#b5522a",
  maisvalia: "#a11d33",
  constante: "#6b5d4a",
};

const h = (x: SimValue) => Number(x) || 0;
/** m/v da configuração corrente. */
const razao = (v: Record<string, SimValue>) =>
  (h(v.jornada) - h(v.necessario)) / h(v.necessario);

export const teoriaDoValor: FlowSpec = {
  slug: "teoria-do-valor",
  title: "o valor em Marx",
  script: "D–M–D′",
  subtitle:
    "Da mercadoria à taxa de mais-valia, no percurso d'O Capital — e conduzindo: as jornadas são clicáveis e a conta se refaz.",
  blurb:
    "A célula, a dupla natureza, o dinheiro, o enigma do acréscimo e a mercadoria peculiar que o resolve. Tudo contado em horas, com as leituras da taxa acendendo conforme a jornada que você montar.",
  footer: [
    "toda grandeza aqui é tempo de trabalho — o preço só traduz",
    "Com os defaults (c=4, v=4, jornada=8) a taxa é 100%: o exemplo do próprio Marx. Estique a jornada sem mexer no necessário e verá a mais-valia absoluta; encurte o necessário e verá a relativa.",
  ],
  groups: [
    {
      id: "dupla",
      label: "a dupla natureza",
      sub: "o mesmo produto, o mesmo trabalho, dois lados",
    },
    {
      id: "jornada-g",
      label: "a jornada de trabalho",
      sub: "o dia repartido — clique nas horas",
    },
    {
      id: "leituras",
      label: "leituras da taxa",
      sub: "acende a da jornada que você montou",
    },
  ],
  steps: [
    {
      ids: ["mercadoria"],
      note: "O Capital abre pela mercadoria: a forma elementar da riqueza burguesa. Tudo o que segue já está dobrado aqui.",
    },
    {
      ids: ["uso", "valor", "concreto", "abstrato"],
      note: "A dupla natureza: o produto serve E se troca porque o trabalho é ofício E dispêndio comum. Marx chamou esta dobra de seu ponto de partida.",
    },
    {
      ids: ["tsn", "dinheiro"],
      note: "A grandeza do valor é tempo socialmente necessário — a sociedade cronometra — e sua forma acabada é o dinheiro, que só traduz.",
    },
    {
      ids: ["capital"],
      note: "D–M–D′: comprar para vender mais caro. O enigma: se a troca é de equivalentes, de onde sai o acréscimo?",
    },
    {
      ids: ["mp", "ft"],
      note: "A resposta exige uma mercadoria cujo USO crie valor: a força de trabalho. Os meios de produção só transferem o que já têm.",
    },
    {
      ids: ["producao", "jornada", "necessario", "excedente"],
      note: "Na produção o dia se reparte: horas que repõem o salário, horas que excedem. Clique nas jornadas — a conta se refaz.",
    },
    {
      ids: ["taxa", "total", "l-branda", "l-meio", "l-alheia"],
      note: "A taxa m/v mede o grau de exploração e a leitura certa acende sozinha. O valor total é sempre a soma: tudo aqui é tempo.",
    },
  ],
  nodes: [
    {
      id: "mercadoria",
      script: "M",
      label: "mercadoria",
      gloss: "a forma elementar",
      detail:
        "O livro abre por ela: nesta sociedade a riqueza aparece como uma 'imensa coleção de mercadorias'. É a célula — na sua dobra mais simples já estão escondidos o valor, o dinheiro e o capital.",
      accent: V.dinheiro,
      rank: 0,
      column: 0,
    },
    {
      id: "concreto",
      label: "trabalho concreto",
      gloss: "alfaiate, tecelão",
      detail:
        "Cada ofício produz seu valor de uso próprio. Vistos assim, os trabalhos são tão incomensuráveis quanto seus produtos.",
      accent: V.uso,
      variant: "compact",
      rank: 1,
      column: -2,
      group: "dupla",
    },
    {
      id: "uso",
      label: "valor de uso",
      gloss: "serve a uma necessidade",
      detail:
        "Casaco veste, trigo alimenta. É condição de toda mercadoria — ninguém troca o inútil — mas não explica a troca: valores de uso não se medem entre si.",
      accent: V.uso,
      variant: "compact",
      rank: 1,
      column: -1,
      group: "dupla",
    },
    {
      id: "valor",
      label: "valor",
      gloss: "o que a troca iguala",
      detail:
        "1 casaco = 20 varas de linho: igualar coisas distintas exige um terceiro comum, e não é a utilidade — é serem todas produto de trabalho humano indistinto.",
      accent: V.valor,
      variant: "compact",
      rank: 1,
      column: 1,
      group: "dupla",
    },
    {
      id: "abstrato",
      label: "trabalho abstrato",
      gloss: "dispêndio sem qualidade",
      detail:
        "O mesmo trabalho visto sem ofício: gasto de músculo, nervo e cérebro em geral. É a substância do valor.",
      accent: V.valor,
      variant: "compact",
      rank: 1,
      column: 2,
      group: "dupla",
    },
    {
      id: "dinheiro",
      script: "£",
      label: "dinheiro",
      gloss: "a forma acabada do valor",
      detail:
        "O equivalente geral: a mercadoria em que todas as outras exprimem valor. Não inventa nada — dá corpo ao que a troca já fazia às cegas.",
      accent: V.dinheiro,
      rank: 2,
      column: -1,
    },
    {
      id: "tsn",
      script: "t̄",
      label: "tempo socialmente necessário",
      gloss: "a medida da grandeza",
      detail:
        "Não o tempo que EU levei: o tempo médio, com a técnica e a destreza correntes. O lento não cria mais valor por demorar — quem cronometra é a sociedade.",
      accent: V.valor,
      rank: 2,
      column: 1,
    },
    {
      id: "capital",
      script: "D–M–D′",
      label: "capital",
      gloss: "valor que se valoriza",
      detail:
        "Comprar para vender mais caro. O fim não é o uso, é o acréscimo — e o enigma é de onde sai o ′, se a circulação troca equivalentes. A resposta não está na circulação: está no que se compra.",
      accent: V.capital,
      rank: 3,
      column: 0,
    },
    {
      id: "mp",
      script: "c",
      label: "meios de produção",
      gloss: "capital constante — horas transferidas",
      detail:
        "Máquina, matéria, energia: transferem ao produto o valor que já têm, gota a gota, e nem um minuto a mais. Aqui, 4 horas por jornada — por isso 'constante'.",
      accent: V.constante,
      rank: 4,
      column: -1,
      compute: () => 4,
    },
    {
      id: "ft",
      script: "FT",
      label: "força de trabalho",
      gloss: "capital variável — a mercadoria peculiar",
      detail:
        "Seu valor é o tempo de reproduzi-la (o salário); seu USO é trabalhar — e trabalhar cria mais valor do que ela custa. O acréscimo inteiro mora nessa diferença.",
      accent: V.trabalho,
      rank: 4,
      column: 1,
    },
    {
      id: "producao",
      script: "P",
      label: "produção",
      gloss: "onde o valor cresce",
      detail:
        "c passa adiante; v se reproduz e excede. É aqui, e não no mercado, que o enigma da circulação se resolve — o mercado só realiza o que a jornada já decidiu.",
      accent: V.capital,
      rank: 5,
      column: 0,
    },
    {
      id: "jornada",
      script: "J",
      label: "jornada",
      gloss: "horas do dia — clique",
      detail:
        "O comprimento do dia de trabalho. Não é dado técnico, é resultado de luta — o capítulo das leis fabris inglesas é o mais sangrento do livro. Esticá-la com v fixo é a mais-valia ABSOLUTA.",
      accent: V.trabalho,
      rank: 6,
      column: -1,
      group: "jornada-g",
      input: { initial: 8, cycle: [8, 10, 12] },
    },
    {
      id: "necessario",
      script: "v",
      label: "trabalho necessário",
      gloss: "horas do salário — clique",
      detail:
        "As horas em que o operário reproduz o próprio salário. Baratear os meios de vida (produtividade) encurta esta parte com a jornada parada — é a mais-valia RELATIVA.",
      accent: V.valor,
      rank: 6,
      column: 1,
      group: "jornada-g",
      input: { initial: 4, cycle: [4, 5, 6] },
    },
    {
      id: "excedente",
      script: "m",
      label: "mais-trabalho",
      gloss: "horas para o capital",
      detail:
        "O que sobra da jornada depois do necessário. Não aparece em contrato nenhum: o salário compra o dia inteiro e por isso PARECE pagar o dia inteiro — a forma-salário é o disfarce.",
      accent: V.maisvalia,
      rank: 7,
      column: 0,
      group: "jornada-g",
      compute: (v) => h(v.jornada) - h(v.necessario),
    },
    {
      id: "taxa",
      script: "m∕v",
      label: "taxa de mais-valia",
      gloss: "o grau de exploração",
      detail:
        "Horas alheias sobre horas próprias: a medida exata. A taxa de lucro (m sobre c+v) a disfarça, diluindo o excedente no capital inteiro — comparar as duas é ver o disfarce funcionar.",
      accent: V.maisvalia,
      rank: 8,
      column: -1,
      compute: (v) => `${Math.round(razao(v) * 100)}%`,
    },
    {
      id: "total",
      script: "W",
      label: "valor do produto",
      gloss: "c + v + m, em horas",
      detail:
        "A soma do dia: o que a máquina passou, o que o salário repôs, o que ficou com o capital. Note que W sobe com a jornada — e o preço, lá fora, só traduz esta soma.",
      accent: V.dinheiro,
      rank: 8,
      column: 1,
      compute: (v) => 4 + h(v.jornada),
    },
    {
      id: "l-branda",
      script: "m∕v < 1",
      label: "jornada branda",
      gloss: "mais horas próprias que alheias",
      accent: V.uso,
      variant: "compact",
      rank: 9,
      column: -1,
      group: "leituras",
      activeWhen: (v) => razao(v) < 1,
    },
    {
      id: "l-meio",
      script: "m∕v = 1",
      label: "meio a meio",
      gloss: "metade do dia é alheia",
      accent: V.dinheiro,
      variant: "compact",
      rank: 9,
      column: 0,
      group: "leituras",
      activeWhen: (v) => razao(v) === 1,
    },
    {
      id: "l-alheia",
      script: "m∕v > 1",
      label: "dia mais alheio que próprio",
      gloss: "a regra, não a exceção",
      accent: V.maisvalia,
      variant: "compact",
      rank: 9,
      column: 1,
      group: "leituras",
      activeWhen: (v) => razao(v) > 1,
    },
  ],
  edges: [
    { from: "mercadoria", to: "uso", kind: "flow", accent: V.uso },
    { from: "mercadoria", to: "valor", kind: "flow", accent: V.valor },
    {
      from: "concreto",
      to: "uso",
      kind: "aside",
      label: "produz",
      accent: V.uso,
    },
    {
      from: "abstrato",
      to: "valor",
      kind: "aside",
      label: "constitui",
      accent: V.valor,
    },
    {
      from: "valor",
      to: "tsn",
      kind: "flow",
      label: "medido em",
      accent: V.valor,
    },
    {
      from: "valor",
      to: "dinheiro",
      kind: "flow",
      label: "aparece como",
      accent: V.dinheiro,
    },
    {
      from: "dinheiro",
      to: "capital",
      kind: "flow",
      label: "posto em circuito",
      accent: V.capital,
    },
    { from: "tsn", to: "capital", kind: "flow", accent: V.valor },
    {
      from: "capital",
      to: "mp",
      kind: "flow",
      label: "compra",
      accent: V.constante,
    },
    {
      from: "capital",
      to: "ft",
      kind: "flow",
      label: "compra",
      accent: V.trabalho,
    },
    {
      from: "mp",
      to: "producao",
      kind: "flow",
      label: "transfere c",
      accent: V.constante,
    },
    {
      from: "ft",
      to: "producao",
      kind: "flow",
      label: "cria valor novo",
      accent: V.trabalho,
    },
    {
      from: "producao",
      to: "jornada",
      kind: "flow",
      label: "abre o dia",
      accent: V.trabalho,
    },
    { from: "producao", to: "necessario", kind: "flow", accent: V.valor },
    { from: "jornada", to: "excedente", kind: "flow", accent: V.trabalho },
    {
      from: "necessario",
      to: "excedente",
      kind: "flow",
      label: "desconta",
      accent: V.valor,
    },
    {
      from: "excedente",
      to: "taxa",
      kind: "flow",
      label: "sobre v",
      accent: V.maisvalia,
    },
    {
      from: "excedente",
      to: "total",
      kind: "flow",
      label: "soma-se",
      accent: V.dinheiro,
    },
  ],
};
