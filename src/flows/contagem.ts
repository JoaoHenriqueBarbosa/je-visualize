/**
 * As duas geometrias do sāṃkhya: o sankey da contabilidade da criação e o
 * venn dos pramāṇas entre escolas.
 *
 * Sāṃkhya significa enumeração — então o sankey aqui não é metáfora, é o
 * darśana contado: cada elo carrega o número de tattvas que emergem por
 * aquele canal, e cada nó retém os seus. E o venn dos pramāṇas é aninhado
 * porque a doutrina é aninhada: cada escola ACEITA os meios da anterior e
 * acrescenta — a discussão é se os acréscimos se reduzem aos três de dentro.
 */

import type { SankeySpec, VennSpec } from "../viz/types";
import { P } from "./palette";

export const contagem: SankeySpec = {
  kind: "sankey",
  slug: "contagem",
  title: "a contabilidade da criação",
  script: "२३",
  subtitle:
    "Sāṃkhya é enumeração: os vinte e três evolutos escorrendo de prakṛti, com a espessura dizendo quantos.",
  blurb:
    "Cada canal carrega o número de tattvas que emergem por ele; cada nó retém os seus. No fim, a soma fecha — é um darśana que se audita.",
  footer: [
    "23 = 1 (mahat) + 1 (ahaṃkāra) + 11 (órgãos) + 5 (sutis) + 5 (grosseiros)",
    "Vaikṛta produz os onze órgãos; bhūtādi, os cinco sutis — e destes saem os cinco grosseiros. Taijasa não produz: energiza os outros dois, e por isso não é canal aqui.",
  ],
  nodes: [
    { id: "prakriti", label: "mūlaprakṛti", script: "मूलप्रकृति", accent: P.prakriti },
    { id: "mahat", label: "mahat", script: "महत्", accent: P.buddhi },
    { id: "ahamkara", label: "ahaṃkāra", script: "अहंकार", accent: P.ahamkara },
    { id: "orgaos", label: "os onze órgãos", script: "एकादश", accent: P.manas },
    { id: "tanmatra", label: "tanmātra", script: "तन्मात्र", accent: P.tanmatra },
    { id: "bhuta", label: "mahābhūta", script: "महाभूत", accent: P.bhuta },
  ],
  links: [
    { from: "prakriti", to: "mahat", value: 23 },
    { from: "mahat", to: "ahamkara", value: 22 },
    { from: "ahamkara", to: "orgaos", value: 11 },
    { from: "ahamkara", to: "tanmatra", value: 10 },
    { from: "tanmatra", to: "bhuta", value: 5 },
  ],
};

export const pramanaEscolas: VennSpec = {
  kind: "venn",
  slug: "pramana-escolas",
  title: "pramāṇa entre escolas",
  script: "प्रमाण",
  subtitle:
    "Três dentro de quatro dentro de seis: cada escola aceita os meios da de dentro e acrescenta os seus.",
  blurb:
    "O núcleo de três do Sāṃkhya, o quarto do Nyāya, os dois da Mīmāṃsā — e a tese do Sāṃkhya é que os anéis de fora se dobram para dentro.",
  footer: [
    "a discussão nunca é sobre os três de dentro",
    "Sāṃkhya absorve upamāna, arthāpatti e anupalabdhi em anumāna: para ele os anéis são aparência. As escolas de fora respondem que reduzir é perder o que cada meio tem de próprio.",
  ],
  mode: "nested",
  sets: [
    {
      id: "samkhya",
      label: "sāṃkhya",
      note: "três bastam",
      accent: P.buddhi,
    },
    {
      id: "nyaya",
      label: "nyāya",
      note: "+ comparação",
      accent: P.indriya,
    },
    {
      id: "mimamsa",
      label: "mīmāṃsā (bhāṭṭa)",
      note: "+ postulação e ausência",
      accent: P.citta,
    },
  ],
  items: [
    { id: "pratyaksha", label: "pratyakṣa", script: "प्रत्यक्ष", set: "samkhya" },
    { id: "anumana", label: "anumāna", script: "अनुमान", set: "samkhya" },
    { id: "shabda", label: "śabda", script: "शब्द", set: "samkhya" },
    { id: "upamana", label: "upamāna", script: "उपमान", set: "nyaya" },
    { id: "arthapatti", label: "arthāpatti", script: "अर्थापत्ति", set: "mimamsa" },
    { id: "anupalabdhi", label: "anupalabdhi", script: "अनुपलब्धि", set: "mimamsa" },
  ],
};
