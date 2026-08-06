/**
 * Os 25 tattvas — o flow mais denso, e o que ensinou topologia ao projeto.
 *
 * A lição, gravada aqui porque foi aqui que custou: as duas cadeias que
 * saem de ahaṃkāra (vaikṛta → manas → indriyas e bhūtādi → tanmātras →
 * mahābhūtas) são RAMOS IRMÃOS e correm em ranks iguais, colunas opostas.
 * A primeira versão as empilhava em ranks sequenciais, e o sintoma era uma
 * aresta atravessando meio canvas vazio. Sequência de rank deve significar
 * sequência no assunto; bifurcação pede paralelo.
 */

import type { EdgeSpec, NodeSpec, FlowSpec } from "../flow/types";
import { P } from "./palette";

/** Fileira de cinco irmãos: mesma camada, colunas -2..2, sem arestas entre si. */
const row = (
  rank: number,
  baseColumn: number,
  group: string,
  accent: string,
  items: [string, string, string, string][]
): NodeSpec[] =>
  items.map(([id, script, label, gloss], i) => ({
    id,
    script,
    label,
    gloss,
    accent,
    variant: "compact" as const,
    rank,
    column: baseColumn + i,
    group,
  }));

const jnanendriya = row(5, -2, "jnana", P.indriya, [
  ["shrotra", "श्रोत्र", "śrotra", "ouvido"],
  ["tvac", "त्वच्", "tvac", "pele"],
  ["caksus", "चक्षुस्", "cakṣus", "olho"],
  ["rasana", "रसन", "rasana", "língua"],
  ["ghrana", "घ्राण", "ghrāṇa", "nariz"],
]);

const karmendriya = row(6, -2, "karma", P.manas, [
  ["vac", "वाच्", "vāc", "fala"],
  ["pani", "पाणि", "pāṇi", "mão"],
  ["pada", "पाद", "pāda", "pé"],
  ["payu", "पायु", "pāyu", "excreção"],
  ["upastha", "उपस्थ", "upastha", "geração"],
]);

const tanmatra = row(5, 4, "tanmatra", P.tanmatra, [
  ["shabda", "शब्द", "śabda", "som"],
  ["sparsha", "स्पर्श", "sparśa", "tato"],
  ["rupa", "रूप", "rūpa", "forma"],
  ["rasa", "रस", "rasa", "sabor"],
  ["gandha", "गन्ध", "gandha", "odor"],
]);

const mahabhuta = row(6, 4, "bhuta", P.bhuta, [
  ["akasha", "आकाश", "ākāśa", "espaço"],
  ["vayu", "वायु", "vāyu", "ar"],
  ["tejas", "तेजस्", "tejas", "fogo"],
  ["ap", "अप्", "ap", "água"],
  ["prthivi", "पृथिवी", "pṛthivī", "terra"],
]);

/** Cada sutil produz seu grosseiro, na mesma coluna: reta e curta. */
const sutilParaGrosseiro: EdgeSpec[] = tanmatra.map((t, i) => ({
  from: t.id,
  to: mahabhuta[i].id,
  kind: "flow",
  accent: P.tanmatra,
}));

export const tattvas: FlowSpec = {
  slug: "tattvas",
  title: "pañcaviṃśati tattva",
  script: "पञ्चविंशति तत्त्व",
  subtitle:
    "Os vinte e cinco princípios: como o inconsciente que se desdobra é visto por aquilo que só olha.",
  blurb:
    "A cosmologia inteira do Sāṃkhya numa página. Prakṛti evolui em vinte e três; puruṣa não evolui em nada — e é a presença dele que faz a evolução parecer ter dono.",
  footer: [
    "puruṣa vê e não age · prakṛti age e não vê",
    "Vinte e três evolutos, mais prakṛti que não é evoluto de nada, mais puruṣa que não é evoluto nem evolvente: vinte e cinco.",
  ],
  groups: [
    { id: "tripla", label: "ahaṃkāra tripartido", sub: "por qual guṇa predomina" },
    { id: "jnana", label: "jñānendriya", sub: "cinco portas de percepção" },
    { id: "karma", label: "karmendriya", sub: "cinco portas de ação" },
    { id: "tanmatra", label: "tanmātra", sub: "cinco elementos sutis" },
    { id: "bhuta", label: "mahābhūta", sub: "cinco elementos grosseiros" },
  ],
  nodes: [
    {
      id: "purusha",
      script: "पुरुष",
      label: "puruṣa",
      gloss: "sākṣin — a testemunha",
      detail:
        "Consciência pura, plural, inativa. Não evolui, não produz, não é produzido. Sua mera presença (sānnidhya) basta para que prakṛti se desdobre — como o ímã que move sem tocar.",
      accent: P.purusha,
      round: true,
      rank: 0,
      column: 0,
    },
    {
      id: "prakriti",
      script: "मूलप्रकृति",
      label: "mūlaprakṛti",
      gloss: "avyakta — o não-manifesto",
      detail:
        "A raiz não-produzida de tudo que é produzido. Equilíbrio dos três guṇas; quando o equilíbrio se rompe, começa a evolução. Inconsciente, mas teleológica: age para a libertação do puruṣa.",
      accent: P.prakriti,
      rank: 0,
      column: 3,
    },
    {
      id: "mahat",
      script: "महत्",
      label: "mahat · buddhi",
      gloss: "adhyavasāya — determinação",
      detail:
        "O grande princípio, primeiro evoluto. Cósmico é mahat; individual é buddhi. É a superfície onde o reflexo do puruṣa aparece — e por isso onde a confusão entre ver e agir começa.",
      accent: P.buddhi,
      rank: 1,
      column: 3,
    },
    {
      id: "ahamkara",
      script: "अहंकार",
      label: "ahaṃkāra",
      gloss: "abhimāna — apropriação",
      detail:
        "Onde o processo impessoal ganha um dono. Tudo abaixo daqui é produto de uma identificação, não de uma substância nova.",
      accent: P.ahamkara,
      rank: 2,
      column: 3,
    },
    {
      id: "vaikrta",
      script: "वैकृत",
      label: "vaikṛta",
      gloss: "sāttvika — modo lúcido",
      detail: "Produz os onze órgãos: manas e as dez portas.",
      accent: P.sattva,
      variant: "compact",
      rank: 3,
      column: 0,
      group: "tripla",
    },
    {
      id: "taijasa",
      script: "तैजस",
      label: "taijasa",
      gloss: "rājasa — modo ativo",
      detail: "Não produz nada sozinho: fornece a energia às outras duas.",
      accent: P.rajas,
      variant: "compact",
      rank: 3,
      column: 3,
      group: "tripla",
    },
    {
      id: "bhutadi",
      script: "भूतादि",
      label: "bhūtādi",
      gloss: "tāmasa — modo inerte",
      detail: "Produz os cinco tanmātras, e destes os cinco elementos.",
      accent: P.tamas,
      variant: "compact",
      rank: 3,
      column: 6,
      group: "tripla",
    },
    {
      id: "manas",
      script: "मनस्",
      label: "manas",
      gloss: "saṅkalpa — o décimo primeiro órgão",
      detail:
        "Conta como órgão de percepção e de ação ao mesmo tempo. Coordena as dez portas; sem ele, os sentidos entregam dado que ninguém junta.",
      accent: P.manas,
      rank: 4,
      column: -2,
    },
    ...jnanendriya,
    ...karmendriya,
    ...tanmatra,
    ...mahabhuta,
  ],
  /**
   * O passeio: a cosmologia na ordem em que ela acontece. Cada passo lista
   * só o que entra; o canvas acumula. É o diagrama mais denso do site, e é
   * exatamente por isso que ele ganhou narração.
   */
  steps: [
    {
      ids: ["purusha", "prakriti"],
      note: "Os dois incriados: puruṣa vê e não age, prakṛti age e não vê. Tudo o mais deriva — estes dois não.",
    },
    {
      ids: ["mahat"],
      note: "O equilíbrio se rompe e surge mahat, a determinação — a superfície onde o reflexo do puruṣa aparece.",
    },
    {
      ids: ["ahamkara"],
      note: "Ahaṃkāra: o processo impessoal ganha um dono. Tudo abaixo daqui é produto de uma identificação.",
    },
    {
      ids: ["vaikrta", "taijasa", "bhutadi"],
      note: "O eu-fazedor se reparte pelos guṇas: o lúcido produzirá órgãos, o inerte produzirá matéria, e o ativo só fornece energia aos outros dois.",
    },
    {
      ids: [
        "manas",
        "shrotra",
        "tvac",
        "caksus",
        "rasana",
        "ghrana",
        "vac",
        "pani",
        "pada",
        "payu",
        "upastha",
      ],
      note: "De vaikṛta, os onze órgãos: manas coordenando cinco portas de percepção e cinco de ação.",
    },
    {
      ids: [
        "shabda",
        "sparsha",
        "rupa",
        "rasa",
        "gandha",
        "akasha",
        "vayu",
        "tejas",
        "ap",
        "prthivi",
      ],
      note: "De bhūtādi, os cinco sutis — e de cada sutil, seu grosseiro. Vinte e três evolutos, mais os dois incriados: vinte e cinco.",
    },
  ],
  edges: [
    {
      from: "purusha",
      to: "prakriti",
      label: "sānnidhya — a mera presença",
      kind: "illumine",
      accent: P.purusha,
    },
    {
      from: "prakriti",
      to: "mahat",
      label: "rompe-se o equilíbrio dos guṇas",
      accent: P.prakriti,
    },
    {
      from: "mahat",
      to: "ahamkara",
      label: "a determinação ganha dono",
      accent: P.buddhi,
    },
    { from: "ahamkara", to: "vaikrta", accent: P.ahamkara },
    { from: "ahamkara", to: "taijasa", accent: P.ahamkara },
    { from: "ahamkara", to: "bhutadi", accent: P.ahamkara },
    {
      from: "taijasa",
      to: "vaikrta",
      label: "energiza",
      kind: "aside",
      accent: P.rajas,
    },
    {
      from: "taijasa",
      to: "bhutadi",
      label: "energiza",
      kind: "aside",
      accent: P.rajas,
    },
    { from: "vaikrta", to: "manas", label: "os onze órgãos", accent: P.sattva },
    {
      from: "manas",
      to: "shrotra",
      label: "coordena",
      accent: P.manas,
      fromSide: "b",
      toSide: "l",
    },
    {
      from: "manas",
      to: "vac",
      kind: "aside",
      accent: P.manas,
      fromSide: "b",
      toSide: "l",
    },
    {
      from: "bhutadi",
      to: "rupa",
      label: "o sutil antes do grosseiro",
      accent: P.tamas,
    },
    ...sutilParaGrosseiro,
  ],
};
