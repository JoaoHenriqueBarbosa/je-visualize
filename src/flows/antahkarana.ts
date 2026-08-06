import type { FlowSpec } from "../flow/types";
import { P } from "./palette";

export const antahkarana: FlowSpec = {
  slug: "antahkarana",
  title: "antaḥkaraṇa",
  script: "अन्तःकरण",
  subtitle:
    "As camadas do instrumento interno — e o que atravessa todas elas sem pertencer a nenhuma.",
  blurb:
    "Como a percepção vira dúvida, a dúvida vira decisão, e a decisão vira 'minha'. Quatro funções e um reflexo.",
  footer: [
    "manas duvida · buddhi resolve · ahaṃkāra se apropria · citta guarda",
    "Vedānta às vezes reduz a dois, tratando ahaṃkāra e citta como funções de manas e buddhi.",
  ],
  groups: [
    { id: "ak", label: "antaḥkaraṇa", sub: "o instrumento interno" },
  ],
  nodes: [
    {
      id: "indriya",
      script: "इन्द्रिय",
      label: "indriya",
      gloss: "os sentidos",
      detail:
        "Cinco jñānendriyas de percepção e cinco karmendriyas de ação. Entregam o dado bruto; nada decidem.",
      accent: P.indriya,
      column: 0,
    },
    {
      id: "manas",
      script: "मनस्",
      label: "manas",
      gloss: "saṅkalpa · vikalpa",
      detail:
        "A mente que oscila: propõe e retira, considera e desconsidera. Recebe dos indriyas e remói sem fechar. Dúvida como modo de operação.",
      accent: P.manas,
      column: 0,
      group: "ak",
    },
    {
      id: "buddhi",
      script: "बुद्धि",
      label: "buddhi",
      gloss: "niścayātmikā vṛtti",
      detail:
        "Corta a oscilação com um niścaya — determinação. Não é viveka: é o órgão onde viveka acontece quando está afiado. Superfície mais límpida do antaḥkaraṇa, e por isso onde o reflexo aparece nítido.",
      accent: P.buddhi,
      column: 0,
      group: "ak",
    },
    {
      id: "ahamkara",
      script: "अहंकार",
      label: "ahaṃkāra",
      gloss: "aham + kāra — o fazer do eu",
      detail:
        "Toma a conclusão de buddhi e a carimba como minha. Constrói o jīva como kartṛtva (agente) e bhoktṛtva (fruidor). Sem ele não há agência; hipertrofiado, confunde o ator com o personagem.",
      accent: P.ahamkara,
      column: 0,
      group: "ak",
    },
    {
      id: "citta",
      script: "चित्त",
      label: "citta",
      gloss: "smaraṇa · saṃskāra",
      detail:
        "O depósito. Memória e impressões latentes que condicionam o que manas sequer chega a considerar. Em Patañjali o termo inverte de peso e nomeia o aparato inteiro — cittavṛttinirodha.",
      accent: P.citta,
      column: 1,
      rank: 2,
      group: "ak",
    },
    {
      id: "atman",
      script: "आत्मन्",
      label: "ātman",
      gloss: "caitanya — consciência",
      detail:
        "Não é camada nem parte. Não age, não decide, não lembra. Só ilumina — e o que se toma por 'eu' é o reflexo dessa luz num instrumento.",
      accent: P.purusha,
      round: true,
      column: -1,
      rank: 2,
    },
  ],
  edges: [
    {
      from: "indriya",
      to: "manas",
      label: "viṣaya — o dado bruto",
      accent: P.indriya,
    },
    { from: "manas", to: "buddhi", label: "a dúvida sobe", accent: P.manas },
    {
      from: "buddhi",
      to: "ahamkara",
      label: "a decisão desce",
      accent: P.buddhi,
    },
    {
      from: "ahamkara",
      to: "citta",
      label: "deposita saṃskāra",
      kind: "aside",
      accent: P.ahamkara,
      fromSide: "r",
      toSide: "b",
    },
    {
      from: "citta",
      to: "manas",
      label: "condiciona o que sobe",
      kind: "feedback",
      accent: P.citta,
      fromSide: "t",
      toSide: "r",
    },
    {
      from: "atman",
      to: "buddhi",
      label: "cidābhāsa — o reflexo",
      kind: "illumine",
      accent: P.purusha,
    },
  ],
};
