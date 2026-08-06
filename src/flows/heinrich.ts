/**
 * A Nova Leitura de Marx — Heinrich — e o confronto dela com a leitura
 * tradicional.
 *
 * O cerne qualitativo: trabalho abstrato não é dispêndio fisiológico (isso
 * toda época tem), é uma RELAÇÃO de validação social específica desta
 * sociedade — e por isso o valor não é substância embutida na coisa pela
 * fábrica, é objetividade que só existe na relação entre mercadorias, com o
 * dinheiro como sua única forma de existência (teoria monetária do valor,
 * contra as leituras pré-monetárias).
 *
 * A simulação carrega a tese: o input é a validação — o mercado compra ou
 * não — e é ELE que constitui (ou não) trabalho abstrato e valor. Com
 * venda = 0, o fio literalmente não acende: o dispêndio foi real, o valor
 * não veio a ser. O motor conta a doutrina sozinho.
 *
 * Nuance que os cartões preservam: a produção não é irrelevante — o
 * trabalho privado já se realiza SOB a expectativa da troca. O que a Nova
 * Leitura nega é que o valor esteja pronto antes do tribunal.
 */

import type { FlowSpec, SimValue } from "../flow/types";
import type { CompareSpec } from "../viz/types";
import { V } from "./valor";

const vendeu = (v: Record<string, SimValue>) => !!v.venda;

export const valorHeinrich: FlowSpec = {
  slug: "valor-heinrich",
  title: "o valor em Heinrich",
  script: "M–€",
  subtitle:
    "A Nova Leitura: teoria monetária do valor. O trabalho privado só vira social no tribunal da troca — clique no mercado e veja a constituição acender.",
  blurb:
    "Trabalho abstrato como relação de validação, não fisiologia; valor como objetividade que só existe entre mercadorias; dinheiro como forma constitutiva, não véu. A releitura que desloca o cerne: valor não é produzido — é constituído.",
  footer: [
    "o dispêndio é da fábrica; o valor, do nexo social inteiro",
    "Heinrich, na esteira de Backhaus e Reichelt: as grandezas continuam vindo do trabalho, mas a FORMA que as torna valor é monetária — sem dinheiro, valor não tem como existir. É outra resposta ao mesmo 'o que a troca iguala'.",
  ],
  groups: [
    {
      id: "veredito",
      label: "o veredito da validação",
      sub: "acende o do mercado que você montou",
    },
  ],
  steps: [
    {
      ids: ["trabalho-privado", "nota-fisiologia"],
      note: "Produção privada e independente: dispêndio real de trabalho concreto. A Nova Leitura começa negando que isso, sozinho, já seja 'substância de valor'.",
    },
    {
      ids: ["candidata"],
      note: "O que sai da fábrica é uma candidata: porta valor em potencial, porque foi produzida já mirando a troca — a expectativa da validação organiza a produção desde dentro.",
    },
    {
      ids: ["troca", "nota-tsn"],
      note: "A troca é o tribunal: valida (ou não) o trabalho privado como trabalho social. E a média socialmente necessária se impõe DEPOIS, pelas costas dos produtores. Clique — o mercado decide.",
    },
    {
      ids: ["abstrato", "valor-forma"],
      note: "Trabalho abstrato é relação de validação, não gasto de músculo; o valor é uma objetividade 'fantasmagórica' que só existe ENTRE mercadorias — nunca dentro de uma, sozinha.",
    },
    {
      ids: ["dinheiro-forma", "fetiche", "l-validado", "l-desperdicio"],
      note: "Sem dinheiro o valor não tem forma de existência: teoria monetária contra as leituras pré-monetárias. E a relação validada aparece como propriedade das coisas — o fetiche fecha o circuito.",
    },
  ],
  nodes: [
    {
      id: "trabalho-privado",
      script: "t",
      label: "trabalho privado",
      gloss: "concreto, independente, real",
      detail:
        "Alguém gastou horas, músculo e atenção produzindo por conta própria. Isso é fato fisiológico e acontece em qualquer época — e é exatamente por isso que NÃO pode ser, sozinho, o que faz desta sociedade uma sociedade de valor.",
      accent: V.trabalho,
      rank: 0,
      column: 0,
    },
    {
      id: "nota-fisiologia",
      label: "contra a fisiologia",
      gloss: "a correção qualitativa",
      detail:
        "Se trabalho abstrato fosse gasto de energia, valor existiria no Egito faraônico. O abstrato é forma social: só existe onde produtos privados precisam provar-se sociais na troca.",
      accent: V.valor,
      variant: "compact",
      rank: 0,
      column: 3,
    },
    {
      id: "candidata",
      script: "M?",
      label: "mercadoria candidata",
      gloss: "valor em potencial",
      detail:
        "Da fábrica sai um produto que PRETENDE ser mercadoria. Foi feito sob a expectativa da venda — a troca já organiza a produção por antecipação — mas a pretensão ainda não foi julgada.",
      accent: V.dinheiro,
      rank: 1,
      column: 0,
    },
    {
      id: "troca",
      script: "⇄",
      label: "a troca",
      gloss: "o mercado compra? — clique",
      detail:
        "O tribunal. Aqui o trabalho privado é (ou não é) validado como trabalho social, e a redução ao socialmente necessário se cumpre. Não é formalidade posterior: é o momento em que se decide quanto do dispêndio conta.",
      accent: V.capital,
      rank: 2,
      column: 0,
      input: { initial: 1, cycle: [0, 1] },
    },
    {
      id: "nota-tsn",
      label: "a média ex post",
      gloss: "pelas costas",
      detail:
        "Ninguém consulta a média antes de produzir: ela se impõe depois, no resultado — 'hinter dem Rücken'. O socialmente necessário é veredito, não receita.",
      accent: V.valor,
      variant: "compact",
      rank: 2,
      column: 3,
    },
    {
      id: "abstrato",
      script: "A",
      label: "trabalho abstrato",
      gloss: "relação de validação",
      detail:
        "Não é um segundo trabalho ao lado do concreto, nem o mesmo visto 'sem qualidade': é o que o trabalho privado SE TORNA quando a troca o valida como fração do trabalho total da sociedade.",
      accent: V.valor,
      rank: 3,
      column: -1,
      compute: (v) => (vendeu(v) ? "constituído" : "—"),
    },
    {
      id: "valor-forma",
      script: "W",
      label: "valor",
      gloss: "objetividade entre mercadorias",
      detail:
        "'Nem um átomo de matéria': a objetividade do valor é fantasmagórica — existe apenas na relação de umas mercadorias com outras. Procurá-la dentro da coisa isolada é procurar no lugar errado.",
      accent: V.maisvalia,
      rank: 3,
      column: 1,
      compute: (v) => (vendeu(v) ? "8 h validadas" : "∅"),
    },
    {
      id: "dinheiro-forma",
      script: "€",
      label: "dinheiro",
      gloss: "forma constitutiva, não véu",
      detail:
        "Na leitura tradicional o dinheiro traduz um valor que já existia; aqui ele é a única forma em que valor EXISTE. Teoria monetária do valor: sem equivalente geral, a validação não teria corpo.",
      accent: V.dinheiro,
      rank: 4,
      column: 0,
    },
    {
      id: "fetiche",
      script: "ƒ",
      label: "fetiche",
      gloss: "a relação vira propriedade da coisa",
      detail:
        "Validado e expresso em dinheiro, o nexo social aparece como atributo natural dos produtos — 'isto VALE tanto'. O fetiche não é ilusão dos tolos: é a forma necessária de aparecer de uma sociabilidade indireta.",
      accent: V.capital,
      rank: 5,
      column: 0,
    },
    {
      id: "l-validado",
      script: "✓",
      label: "trabalho tornado social",
      gloss: "o dispêndio contou",
      accent: V.uso,
      variant: "compact",
      rank: 6,
      column: -1,
      group: "veredito",
      activeWhen: (v) => vendeu(v),
    },
    {
      id: "l-desperdicio",
      script: "∅",
      label: "dispêndio sem valor",
      gloss: "real, e ainda assim nada",
      accent: V.maisvalia,
      variant: "compact",
      rank: 6,
      column: 1,
      group: "veredito",
      activeWhen: (v) => !vendeu(v),
    },
  ],
  edges: [
    {
      from: "trabalho-privado",
      to: "candidata",
      kind: "flow",
      label: "termina em",
      accent: V.trabalho,
    },
    {
      from: "trabalho-privado",
      to: "nota-fisiologia",
      kind: "aside",
      accent: V.valor,
    },
    {
      from: "candidata",
      to: "troca",
      kind: "flow",
      label: "levada ao tribunal",
      accent: V.dinheiro,
    },
    { from: "troca", to: "nota-tsn", kind: "aside", accent: V.valor },
    {
      from: "troca",
      to: "abstrato",
      kind: "flow",
      label: "constitui",
      accent: V.valor,
    },
    {
      from: "troca",
      to: "valor-forma",
      kind: "flow",
      label: "constitui",
      accent: V.maisvalia,
    },
    {
      from: "valor-forma",
      to: "dinheiro-forma",
      kind: "flow",
      label: "só existe como",
      accent: V.dinheiro,
    },
    {
      from: "dinheiro-forma",
      to: "fetiche",
      kind: "flow",
      label: "consolida o",
      accent: V.capital,
    },
  ],
};

/* ------------------------------------------------------------------------- */

/**
 * O confronto, no formato do série ‖ paralelo: os dois lados dividem o
 * MESMO trabalho e o MESMO clique de venda, e a diferença entre as leituras
 * vira a única coisa que muda na tela. Não vendeu: à esquerda o valor
 * existe e não se realizou (crise de realização); à direita o valor nunca
 * veio a ser (dispêndio sem validação). Um clique, duas ontologias.
 *
 * Os fios ajudam de propósito: no lado-substância o fio sai ACESO da
 * produção (o valor já nasceu lá); no lado-forma ele só acende depois do
 * tribunal.
 */

const trabalho = {
  id: "trabalho",
  script: "t",
  label: "8 horas de trabalho",
  gloss: "o mesmo dispêndio, dos dois lados",
  detail:
    "Uma jornada privada e concreta, idêntica nas duas colunas. A disputa não é sobre o que aconteceu na fábrica — é sobre O QUE isso já é.",
  accent: V.trabalho,
  rank: 0,
  column: 0,
};

const venda = {
  id: "venda",
  script: "⇄",
  label: "a venda",
  gloss: "o mercado compra? — clique",
  detail:
    "O mesmo mercado para os dois lados: um clique alterna comprar e não comprar, e cada leitura responde com a sua ontologia.",
  accent: V.capital,
  rank: 2,
  column: 0,
  input: { initial: 1, cycle: [0, 1] },
};

const ladoSubstancia: FlowSpec = {
  slug: "valor-substancia",
  title: "leitura tradicional",
  script: "substância",
  subtitle: "o valor nasce na produção",
  blurb: "",
  groups: [
    { id: "veredito", label: "sem venda", sub: "o que este lado diz" },
  ],
  nodes: [
    trabalho,
    {
      id: "producao",
      script: "P",
      label: "produção",
      gloss: "o valor já nasce aqui",
      detail:
        "As 8 horas ficam embutidas na coisa: substância cristalizada de trabalho abstrato, medida antes de qualquer mercado. O que falta é só a metamorfose em dinheiro.",
      accent: V.valor,
      rank: 1,
      column: 0,
      compute: () => 8,
    },
    venda,
    {
      id: "resultado",
      script: "W",
      label: "o valor da coisa",
      gloss: "em horas — vendida ou não",
      detail:
        "8, sempre: a venda realiza um valor que já existia. Se o mercado falha, o valor fica PRESO na mercadoria — perda de forma, não de ser.",
      accent: V.dinheiro,
      rank: 3,
      column: 0,
      compute: () => 8,
    },
    {
      id: "l-crise",
      script: "8h ⚠",
      label: "valor não realizado",
      gloss: "crise de realização",
      accent: V.dinheiro,
      variant: "compact",
      rank: 4,
      column: 0,
      group: "veredito",
      activeWhen: (v) => !vendeu(v),
    },
  ],
  edges: [
    { from: "trabalho", to: "producao", kind: "flow", label: "cristaliza", accent: V.trabalho },
    { from: "producao", to: "venda", kind: "flow", label: "já com valor", accent: V.valor },
    { from: "venda", to: "resultado", kind: "flow", label: "só realiza", accent: V.dinheiro },
  ],
};

const ladoForma: FlowSpec = {
  slug: "valor-forma-social",
  title: "Nova Leitura",
  script: "forma",
  subtitle: "o valor se constitui na validação",
  blurb: "",
  groups: [
    { id: "veredito", label: "sem venda", sub: "o que este lado diz" },
  ],
  nodes: [
    trabalho,
    {
      id: "producao",
      script: "P?",
      label: "produção",
      gloss: "daqui sai uma candidata",
      detail:
        "As 8 horas são dispêndio real feito sob expectativa de troca — mas valor ainda não há: há uma pretensão de valor esperando tribunal.",
      accent: V.valor,
      rank: 1,
      column: 0,
    },
    venda,
    {
      id: "resultado",
      script: "W",
      label: "o valor constituído",
      gloss: "em horas — se validado",
      detail:
        "8 ou 0: a venda não realiza um valor prévio, ela o constitui. Sem validação não há o que realizar — houve trabalho, não houve valor.",
      accent: V.maisvalia,
      rank: 3,
      column: 0,
      compute: (v) => (vendeu(v) ? 8 : 0),
    },
    {
      id: "l-nada",
      script: "∅",
      label: "valor nunca houve",
      gloss: "dispêndio sem validação",
      accent: V.maisvalia,
      variant: "compact",
      rank: 4,
      column: 0,
      group: "veredito",
      activeWhen: (v) => !vendeu(v),
    },
  ],
  edges: [
    { from: "trabalho", to: "producao", kind: "flow", label: "pretende", accent: V.trabalho },
    { from: "producao", to: "venda", kind: "flow", label: "candidata", accent: V.valor },
    { from: "venda", to: "resultado", kind: "flow", label: "constitui", accent: V.maisvalia },
  ],
};

export const produzidoVsConstituido: CompareSpec = {
  kind: "compare",
  slug: "produzido-vs-constituido",
  title: "produzido ‖ constituído",
  script: "8 ‖ ∅",
  subtitle:
    "As mesmas 8 horas, a mesma venda, duas ontologias: clique no mercado e veja cada leitura responder com a sua.",
  blurb:
    "O confronto no formato do série ‖ paralelo: quando a venda falha, um lado diz 'valor preso na mercadoria', o outro diz 'valor que nunca veio a ser'. Toda a distância entre substância e forma cabe nesse desacordo.",
  footer: [
    "realização frustrada ‖ constituição que não houve",
    "Repare nos fios: à esquerda a produção já sai acesa — o valor nasceu lá; à direita nada acende antes do tribunal. O motor desenha a diferença entre as leituras sem precisar dizê-la.",
  ],
  sides: [ladoSubstancia, ladoForma],
};
