import type { FlowSpec } from "../flow/types";
import { P } from "./palette";

export const guna: FlowSpec = {
  slug: "guna",
  title: "triguṇa",
  script: "त्रिगुण",
  subtitle:
    "As três qualidades: não propriedades de prakṛti, mas prakṛti ela mesma vista em três modos.",
  blurb:
    "Sattva, rajas, tamas. Nunca aparecem separados — só em proporção variável, e o que chamamos de coisa é uma proporção que durou.",
  footer: [
    "sattva ilumina · rajas move · tamas fixa",
    "Suprimem-se e sustentam-se mutuamente (anyonyābhibhavāśraya): o que predomina não elimina os outros dois, só os cobre.",
  ],
  groups: [{ id: "tri", label: "triguṇa", sub: "sempre os três, nunca um só" }],
  nodes: [
    {
      id: "prakriti",
      script: "प्रकृति",
      label: "prakṛti",
      gloss: "sāmyāvasthā — o estado de equilíbrio",
      detail:
        "Prakṛti não *tem* os guṇas: prakṛti *é* os três em equilíbrio. Manifestação é o nome que se dá ao rompimento desse equilíbrio.",
      accent: P.prakriti,
      rank: 0,
      column: 0,
    },
    {
      id: "sattva",
      script: "सत्त्व",
      label: "sattva",
      gloss: "prakāśa — luz, leveza",
      detail:
        "O que revela. Torna a mente translúcida o bastante para refletir o puruṣa. Sensação característica: clareza, e também prazer — que é por isso suspeito de ser mais um laço.",
      accent: P.sattva,
      rank: 1,
      column: -1,
      group: "tri",
    },
    {
      id: "rajas",
      script: "रजस्",
      label: "rajas",
      gloss: "pravṛtti — moção, esforço",
      detail:
        "O que move. Único dos três que é ativo por si; os outros dois dependem dele para operar. Sensação característica: inquietação, duḥkha.",
      accent: P.rajas,
      rank: 1,
      column: 1,
      group: "tri",
    },
    {
      id: "tamas",
      script: "तमस्",
      label: "tamas",
      gloss: "niyama — peso, obstrução",
      detail:
        "O que retém. Dá densidade e permanência; sem ele nada teria forma estável. Sensação característica: torpor, indiferença.",
      accent: P.tamas,
      rank: 2,
      column: 0,
      group: "tri",
    },
  ],
  edges: [
    { from: "prakriti", to: "sattva", label: "manifesta-se como", accent: P.prakriti },
    { from: "prakriti", to: "rajas", accent: P.prakriti },
    {
      from: "sattva",
      to: "rajas",
      label: "precisa de rajas para operar",
      kind: "aside",
      accent: P.sattva,
    },
    {
      from: "rajas",
      to: "tamas",
      label: "move o que é inerte",
      kind: "aside",
      accent: P.rajas,
    },
    {
      from: "tamas",
      to: "sattva",
      label: "cobre a luz",
      kind: "feedback",
      accent: P.tamas,
    },
  ],
};

export const pramana: FlowSpec = {
  slug: "pramana",
  title: "pramāṇa",
  script: "प्रमाण",
  subtitle:
    "Os três meios de conhecimento válido — e por que o Sāṃkhya para em três.",
  blurb:
    "Percepção, inferência, testemunho. Outras escolas listam seis; o Sāṃkhya sustenta que as outras três se reduzem a estas.",
  footer: [
    "pratyakṣa vê · anumāna conclui · śabda recebe",
    "Nyāya acrescenta upamāna; Mīmāṃsā, arthāpatti e anupalabdhi. Sāṃkhya as absorve em anumāna.",
  ],
  groups: [
    { id: "tres", label: "pramāṇa-traya", sub: "os três meios aceitos" },
  ],
  nodes: [
    {
      id: "vishaya",
      script: "विषय",
      label: "viṣaya",
      gloss: "o objeto a conhecer",
      detail:
        "O que se apresenta. Antes de qualquer meio, há algo cuja forma ainda não foi determinada.",
      accent: P.indriya,
      rank: 0,
      column: 0,
    },
    {
      id: "pratyaksha",
      script: "प्रत्यक्ष",
      label: "pratyakṣa",
      gloss: "percepção direta",
      detail:
        "Contato do sentido com o objeto, moldado em buddhi. É o pramāṇa-raiz: os outros dois dependem dele em algum ponto da cadeia.",
      accent: P.indriya,
      rank: 1,
      column: -1,
      group: "tres",
    },
    {
      id: "anumana",
      script: "अनुमान",
      label: "anumāna",
      gloss: "inferência",
      detail:
        "Da marca ao marcado, por concomitância invariável (vyāpti). É por anumāna que se conhece prakṛti e puruṣa — nenhum dos dois é percebido.",
      accent: P.buddhi,
      rank: 1,
      column: 0,
      group: "tres",
    },
    {
      id: "shabda",
      script: "शब्द",
      label: "śabda · āptavacana",
      gloss: "testemunho confiável",
      detail:
        "Palavra de quem conhece. Não é apelo à autoridade: vale porque a fonte teve acesso que o ouvinte não tem, e sob condições verificáveis.",
      accent: P.citta,
      rank: 1,
      column: 1,
      group: "tres",
    },
    {
      id: "prama",
      script: "प्रमा",
      label: "pramā",
      gloss: "o conhecimento resultante",
      detail:
        "A vṛtti de buddhi que assume a forma do objeto. O puruṣa não conhece: ele ilumina a vṛtti — e é isso que se chama de conhecer.",
      accent: P.purusha,
      rank: 2,
      column: 0,
    },
  ],
  edges: [
    { from: "vishaya", to: "pratyaksha", accent: P.indriya },
    { from: "vishaya", to: "anumana", label: "por qual via", accent: P.indriya },
    { from: "vishaya", to: "shabda", accent: P.indriya },
    { from: "pratyaksha", to: "prama", accent: P.indriya },
    { from: "anumana", to: "prama", label: "vṛtti determinada", accent: P.buddhi },
    { from: "shabda", to: "prama", accent: P.citta },
    {
      from: "pratyaksha",
      to: "anumana",
      label: "funda",
      kind: "aside",
      accent: P.indriya,
    },
  ],
};

export const kaivalya: FlowSpec = {
  slug: "kaivalya",
  title: "kaivalya",
  script: "कैवल्य",
  subtitle:
    "O problema que o sistema inteiro existe para resolver, e a forma da solução.",
  blurb:
    "Três sofrimentos, uma confusão na raiz, e uma saída que não é conquistar nada — é parar de confundir.",
  footer: [
    "o cativeiro não é real, a confusão é",
    "Kaivalya é 'isolamento': não união com algo, mas o puruṣa deixando de parecer misturado ao que nunca foi ele.",
  ],
  groups: [
    { id: "traya", label: "duḥkha-traya", sub: "as três origens do sofrer" },
  ],
  nodes: [
    {
      id: "adhyatmika",
      script: "आध्यात्मिक",
      label: "ādhyātmika",
      gloss: "de dentro",
      detail: "Corpo e mente: doença, desejo, medo.",
      accent: P.manas,
      variant: "compact",
      rank: 0,
      column: -1,
      group: "traya",
    },
    {
      id: "adhibhautika",
      script: "आधिभौतिक",
      label: "ādhibhautika",
      gloss: "dos outros seres",
      detail: "Gente, bicho, coisa: o mundo que resiste.",
      accent: P.bhuta,
      variant: "compact",
      rank: 0,
      column: 0,
      group: "traya",
    },
    {
      id: "adhidaivika",
      script: "आधिदैविक",
      label: "ādhidaivika",
      gloss: "do que não se controla",
      detail: "Clima, acaso, destino: o que não tem a quem reclamar.",
      accent: P.tamas,
      variant: "compact",
      rank: 0,
      column: 1,
      group: "traya",
    },
    {
      id: "duhkha",
      script: "दुःख",
      label: "duḥkha",
      gloss: "o fato do sofrimento",
      detail:
        "O Sāṃkhya abre com isto, não com metafísica: há sofrimento, os remédios comuns são temporários, e por isso vale procurar um que não seja.",
      accent: P.rajas,
      rank: 1,
      column: 0,
    },
    {
      id: "aviveka",
      script: "अविवेक",
      label: "aviveka",
      gloss: "a não-discriminação",
      detail:
        "A raiz: tomar o instrumento pelo si. Buddhi decide e o puruṣa parece ter decidido; o corpo dói e o puruṣa parece doer. Nada de fato se mistura — a confusão é que é real.",
      accent: P.ahamkara,
      rank: 2,
      column: 0,
    },
    {
      id: "vivekakhyati",
      script: "विवेकख्याति",
      label: "vivekakhyāti",
      gloss: "a discriminação estabelecida",
      detail:
        "Não um insight que passa, mas um discernimento que se sustenta: puruṣa não é prakṛti, e nada do que acontece em buddhi jamais aconteceu com quem olha.",
      accent: P.buddhi,
      rank: 3,
      column: 0,
    },
    {
      id: "kaivalya",
      script: "कैवल्य",
      label: "kaivalya",
      gloss: "isolamento",
      detail:
        "Prakṛti para — não porque foi vencida, mas porque cumpriu o que fazia. Como a dançarina que se retira depois de ter sido vista.",
      accent: P.purusha,
      round: true,
      rank: 4,
      column: 0,
    },
    {
      id: "purusha",
      script: "पुरुष",
      label: "puruṣa",
      gloss: "quem nunca esteve preso",
      detail:
        "Não é libertado: descobre-se que nunca foi ligado. O cativeiro pertencia a prakṛti; a libertação também.",
      accent: P.purusha,
      round: true,
      rank: 2,
      column: -2,
    },
  ],
  edges: [
    { from: "adhibhautika", to: "duhkha", label: "convergem em", accent: P.rajas },
    { from: "adhyatmika", to: "duhkha", accent: P.rajas },
    { from: "adhidaivika", to: "duhkha", accent: P.rajas },
    {
      from: "duhkha",
      to: "aviveka",
      label: "cuja causa é",
      accent: P.rajas,
    },
    {
      from: "aviveka",
      to: "vivekakhyati",
      label: "desfeita por",
      accent: P.ahamkara,
    },
    {
      from: "vivekakhyati",
      to: "kaivalya",
      label: "prakṛti cessa de exibir",
      accent: P.buddhi,
    },
    {
      from: "purusha",
      to: "aviveka",
      label: "parece envolvido, e não está",
      kind: "illumine",
      accent: P.purusha,
    },
  ],
};
