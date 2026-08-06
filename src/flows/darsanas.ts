/**
 * ṣaḍdarśana — os seis darśanas como registros.
 *
 * O primeiro assunto tabular do site: seis linhas, três projeções. A tabela
 * compara doutrinas, o kanban agrupa pelas duplas clássicas (samānatantra —
 * cada par divide método e vocabulário), e o gantt põe os textos-raiz no
 * tempo. O mesmo dado, três leituras — nada é digitado duas vezes.
 *
 * Serve à coleção do sāṃkhya como contexto: onde ele está entre os irmãos.
 * Datas são as dos TEXTOS-RAIZ (composição estimada, sempre discutida), não
 * das escolas — toda escola é mais velha que seu sūtra.
 */

import type { RecordsSpec } from "../viz/types";
import { P } from "./palette";

const DUPLAS = [
  { id: "nyaya-vaisesika", label: "nyāya · vaiśeṣika", accent: P.indriya },
  { id: "samkhya-yoga", label: "sāṃkhya · yoga", accent: P.buddhi },
  { id: "mimamsa-vedanta", label: "mīmāṃsā · vedānta", accent: P.citta },
];

export const darsanas: RecordsSpec = {
  kind: "records",
  slug: "darsanas",
  title: "ṣaḍdarśana",
  script: "षड्दर्शन",
  subtitle:
    "Os seis pontos de vista āstika, em três leituras do mesmo dado: doutrina, duplas e tempo.",
  blurb:
    "Onde o sāṃkhya está entre os irmãos: seis registros, três projeções — a tabela compara, o kanban pareia, a linha do tempo situa os textos-raiz.",
  footer: [
    "seis escolas, três duplas, um cânone cada",
    "As datas são dos textos-raiz, sempre estimadas — toda escola é mais velha que seu sūtra. O sāṃkhya é o caso extremo: a Kārikā é tardia e a escola, talvez a mais antiga de todas.",
  ],
  titleField: "nome",
  fields: [
    { id: "nome", label: "darśana", type: "text" },
    { id: "dupla", label: "dupla", type: "select", options: DUPLAS },
    { id: "texto", label: "texto-raiz", type: "text" },
    { id: "pramanas", label: "pramāṇas", type: "number" },
    {
      id: "isvara",
      label: "īśvara",
      type: "select",
      options: [
        { id: "nirisvara", label: "nirīśvara — dispensa", accent: P.rajas },
        { id: "sesvara", label: "seśvara — admite", accent: P.sattva },
        { id: "brahman", label: "brahman — tudo é ele", accent: P.purusha },
      ],
    },
    { id: "periodo", label: "texto-raiz (composição)", type: "range", era: true },
  ],
  rows: [
    {
      id: "nyaya",
      nome: "nyāya",
      dupla: "nyaya-vaisesika",
      texto: "Nyāyasūtra",
      pramanas: 4,
      isvara: "sesvara",
      periodo: [-150, 250],
    },
    {
      id: "vaisesika",
      nome: "vaiśeṣika",
      dupla: "nyaya-vaisesika",
      texto: "Vaiśeṣikasūtra",
      pramanas: 2,
      isvara: "sesvara",
      periodo: [-300, 100],
    },
    {
      id: "samkhya",
      nome: "sāṃkhya",
      dupla: "samkhya-yoga",
      texto: "Sāṃkhyakārikā",
      pramanas: 3,
      isvara: "nirisvara",
      periodo: [350, 450],
    },
    {
      id: "yoga",
      nome: "yoga",
      dupla: "samkhya-yoga",
      texto: "Yogasūtra",
      pramanas: 3,
      isvara: "sesvara",
      periodo: [200, 400],
    },
    {
      id: "mimamsa",
      nome: "mīmāṃsā",
      dupla: "mimamsa-vedanta",
      texto: "Mīmāṃsāsūtra",
      pramanas: 6,
      isvara: "nirisvara",
      periodo: [-300, -100],
    },
    {
      id: "vedanta",
      nome: "vedānta",
      dupla: "mimamsa-vedanta",
      texto: "Brahmasūtra",
      pramanas: 6,
      isvara: "brahman",
      periodo: [-100, 200],
    },
  ],
  views: [
    { type: "table" },
    { type: "kanban", groupBy: "dupla", label: "duplas" },
    { type: "gantt", range: "periodo", accentBy: "dupla" },
  ],
};
