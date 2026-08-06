/**
 * tattvābhyāsa — o conhecimento como máquina de estados.
 *
 * O flow do kaivalya (small.ts) mostra a ESTRUTURA do problema; esta máquina
 * mostra a DINÂMICA: pratica-se, escorrega-se, estabelece-se, e o corpo cai.
 * A doutrina mora nos botões que emudecem — SK 64 diz que o conhecimento
 * nascido da prática dos princípios é definitivo (pramāda em vivekakhyāti
 * não leva a lugar nenhum), e kaivalya é terminal: nenhum evento sai de lá.
 *
 * Os accents vêm da paleta compartilhada: os mesmos princípios, as mesmas
 * cores dos outros diagramas do sāṃkhya. Os eventos têm as cores dos guṇas
 * que os movem — praticar é sattva, descuidar é tamas, e a queda do corpo é
 * ato de prakṛti.
 */

import type { MachineSpec } from "../viz/types";
import { P } from "./palette";

export const tattvabhyasa: MachineSpec = {
  kind: "machine",
  slug: "tattvabhyasa",
  title: "tattvābhyāsa",
  script: "तत्त्वाभ्यास",
  subtitle:
    "A prática sobre os princípios, lida como máquina de estados: quatro estações, três eventos, e um fim sem saída.",
  blurb:
    "Da confusão ao isolamento com os botões contando a doutrina: o cultivo tem duas saídas, o conhecimento firmado não regride, e de kaivalya nenhum evento escapa.",
  footer: [
    "SK 64: evaṃ tattvābhyāsāt — assim, da prática sobre os princípios",
    "SK 67: firmado o conhecimento, o corpo ainda gira por impulso, como a roda do oleiro depois da mão. Quando cai, o isolamento é definitivo — e a máquina emudece de vez.",
  ],
  states: [
    {
      id: "aviveka",
      script: "अविवेक",
      label: "aviveka",
      gloss: "a confusão instalada",
      detail:
        "Tomar o instrumento pelo si: o ponto de partida de todo mundo. Daqui só se sai praticando — e note que pramāda emudece aqui, porque descuido é o que este estado já é.",
      accent: P.ahamkara,
      rank: 0,
      column: 0,
      initial: true,
    },
    {
      id: "abhyasa",
      script: "अभ्यास",
      label: "abhyāsa",
      gloss: "o cultivo intermitente",
      detail:
        "O discernimento aparece e escapa. É o único estado com duas saídas — a prática o firma, o descuido o desfaz — e a direção se decide evento a evento, que é como toda prática se sente por dentro.",
      accent: P.rajas,
      rank: 1,
      column: 0,
    },
    {
      id: "vivekakhyati",
      script: "विवेकख्याति",
      label: "vivekakhyāti",
      gloss: "a discriminação estabelecida",
      detail:
        "Firmado, não regride: pramāda deixa de responder. O corpo continua por impulso, como a roda do oleiro depois que a mão sai — o que falta não é conhecimento, é o impulso acabar.",
      accent: P.buddhi,
      rank: 2,
      column: 0,
    },
    {
      id: "kaivalya",
      script: "कैवल्य",
      label: "kaivalya",
      gloss: "o isolamento — terminal",
      detail:
        "Nenhum evento sai daqui: não é um estado melhor, é o fim da máquina. Prakṛti cessou de exibir para este puruṣa — e o que não se move não precisa de botões.",
      accent: P.purusha,
      rank: 3,
      column: 0,
    },
  ],
  events: [
    { id: "abhyasa-ev", label: "tattvābhyāsa · praticar", accent: P.sattva },
    { id: "pramada", label: "pramāda · descuidar", accent: P.tamas },
    {
      id: "sarirabheda",
      label: "śarīrabheda · o corpo cai",
      accent: P.prakriti,
    },
  ],
  transitions: [
    {
      from: "aviveka",
      to: "abhyasa",
      event: "abhyasa-ev",
      label: "tattvābhyāsa",
      accent: P.sattva,
    },
    {
      from: "abhyasa",
      to: "vivekakhyati",
      event: "abhyasa-ev",
      label: "tattvābhyāsa",
      accent: P.sattva,
    },
    {
      from: "abhyasa",
      to: "aviveka",
      event: "pramada",
      label: "pramāda",
      accent: P.tamas,
      fromSide: "l",
      toSide: "l",
    },
    {
      from: "vivekakhyati",
      to: "kaivalya",
      event: "sarirabheda",
      label: "śarīrabheda",
      accent: P.prakriti,
    },
  ],
};
