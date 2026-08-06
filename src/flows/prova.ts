/**
 * A prova do puruṣa — SK 17, como mapa argumentativo.
 *
 * O flow ganhou vocabulário de argumento: `supports` ordena como flow (a
 * premissa empurra rumo à conclusão) e `attacks` é lateral e tracejada, no
 * vermelho de quem discorda. Os cinco argumentos da kārikā convergem na
 * conclusão; a objeção do agregado ataca; a resposta ataca a objeção e
 * reforça a conclusão. O leitor vê a ESTRUTURA do debate, não só o veredito.
 */

import type { FlowSpec } from "../flow/types";
import { P } from "./palette";

/** O vermelho de quem discorda — reservado às arestas de ataque. */
const ATTACK = "#b04a3e";

export const provaPurusha: FlowSpec = {
  slug: "prova-purusha",
  title: "puruṣo 'sti",
  script: "पुरुषोऽस्ति",
  subtitle:
    "SK 17: cinco razões para haver alguém que vê — e o ataque que a prova precisou sobreviver.",
  blurb:
    "O mapa do argumento: cinco premissas convergindo, a objeção do agregado tracejada em vermelho, e a resposta que devolve o golpe.",
  footer: [
    "saṃghātaparārthatvāt … puruṣo 'sti — 'porque o composto é para-outro … o puruṣa existe'",
    "A objeção é séria e antiga (bauddhas, cārvākas): talvez o agregado baste. A resposta do Sāṃkhya é que 'bastar' já é servir a alguém — todo composto aponta para fora de si.",
  ],
  nodes: [
    {
      id: "samghata",
      script: "संघात",
      label: "o composto é para-outro",
      gloss: "saṃghātaparārthatvāt",
      detail:
        "A cama existe para quem deita; o olho, para quem vê. Todo arranjo de partes serve a algo que não é arranjo de partes.",
      accent: P.buddhi,
      variant: "compact",
      rank: 0,
      column: -2,
    },
    {
      id: "viparyaya",
      script: "विपर्यय",
      label: "o inverso dos guṇas",
      gloss: "triguṇādiviparyayāt",
      detail:
        "O visto é feito dos três guṇas; o vidente precisa ser o inverso disso — sem mistura, sem atividade, sem peso.",
      accent: P.sattva,
      variant: "compact",
      rank: 0,
      column: -1,
    },
    {
      id: "adhisthana",
      script: "अधिष्ठान",
      label: "há superintendência",
      gloss: "adhiṣṭhānāt",
      detail:
        "O carro não anda sem condutor. A máquina psicofísica opera COMO SE supervisionada — e 'como se' é o que se está explicando.",
      accent: P.manas,
      variant: "compact",
      rank: 0,
      column: 0,
    },
    {
      id: "bhoktr",
      script: "भोक्तृ",
      label: "há o fruidor",
      gloss: "bhoktṛbhāvāt",
      detail:
        "O alimento pressupõe quem come. Prazer e dor são DE alguém — experiência sem experimentador é substantivo sem dono.",
      accent: P.rajas,
      variant: "compact",
      rank: 0,
      column: 1,
    },
    {
      id: "kaivalyartha",
      script: "कैवल्यार्थ",
      label: "há o anseio de liberdade",
      gloss: "kaivalyārthaṃ pravṛtteḥ",
      detail:
        "A atividade dos sábios aponta para a libertação. Anseio por ser livre pressupõe alguém que possa sê-lo.",
      accent: P.citta,
      variant: "compact",
      rank: 0,
      column: 2,
    },
    {
      id: "conclusao",
      script: "पुरुषोऽस्ति",
      label: "o puruṣa existe",
      gloss: "a conclusão da kārikā 17",
      detail:
        "Não percebido, e ainda assim provado: é por anumāna que o Sāṃkhya o alcança — a marca (o mundo composto, ordenado, fruído) exige o marcado.",
      accent: P.purusha,
      round: true,
      rank: 1,
      column: 0,
    },
    {
      id: "objecao",
      script: "स्कन्धमात्र",
      label: "só o agregado",
      gloss: "a objeção bauddha-cārvāka",
      detail:
        "Talvez não haja ninguém atrás dos olhos: o composto se basta, e a 'testemunha' é um nome a mais para o próprio fluxo.",
      accent: ATTACK,
      rank: 2,
      column: -1,
    },
    {
      id: "resposta",
      script: "परार्थ",
      label: "bastar já é servir",
      gloss: "a réplica do Sāṃkhya",
      detail:
        "Um agregado que 'se basta' bastaria PARA quê? A própria noção de função aponta para fora do arranjo — negar o para-outro é usá-lo.",
      accent: P.buddhi,
      rank: 2,
      column: 1,
    },
  ],
  edges: [
    { from: "samghata", to: "conclusao", kind: "supports", accent: P.buddhi },
    { from: "viparyaya", to: "conclusao", kind: "supports", accent: P.sattva },
    {
      from: "adhisthana",
      to: "conclusao",
      kind: "supports",
      label: "convergem",
      accent: P.manas,
    },
    { from: "bhoktr", to: "conclusao", kind: "supports", accent: P.rajas },
    { from: "kaivalyartha", to: "conclusao", kind: "supports", accent: P.citta },
    {
      from: "objecao",
      to: "conclusao",
      kind: "attacks",
      label: "nega",
      accent: ATTACK,
    },
    {
      from: "resposta",
      to: "objecao",
      kind: "attacks",
      label: "devolve",
      accent: ATTACK,
    },
    {
      from: "resposta",
      to: "conclusao",
      kind: "supports",
      accent: P.buddhi,
    },
  ],
};
