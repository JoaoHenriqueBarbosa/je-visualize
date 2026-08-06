import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  BackgroundVariant,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import ConceptNode, { type ConceptData } from "./ConceptNode";
import FieldNode from "./FieldNode";
import "./App.css";

const nodeTypes = { concept: ConceptNode, field: FieldNode };

const C = {
  manas: "#c98b3f",
  buddhi: "#d6c15e",
  ahamkara: "#c05a45",
  chitta: "#6d8f7a",
  atman: "#e8e2d4",
  indriya: "#7a7f96",
};

const concept = (
  id: string,
  x: number,
  y: number,
  data: ConceptData
): Node<ConceptData, "concept"> => ({
  id,
  type: "concept",
  position: { x, y },
  data,
});

const nodes: Node[] = [
  {
    id: "field",
    type: "field",
    position: { x: 120, y: 88 },
    data: { label: "antaḥkaraṇa", sub: "अन्तःकरण — o instrumento interno" },
    draggable: false,
    selectable: false,
    zIndex: -1,
  },

  concept("indriya", 178, -32, {
    devanagari: "इन्द्रिय",
    iast: "indriya",
    gloss: "os sentidos",
    detail:
      "Cinco jñānendriyas de percepção e cinco karmendriyas de ação. Entregam o dado bruto; nada decidem.",
    accent: C.indriya,
  }),

  concept("manas", 178, 148, {
    devanagari: "मनस्",
    iast: "manas",
    gloss: "saṅkalpa · vikalpa",
    detail:
      "A mente que oscila: propõe e retira, considera e desconsidera. Recebe dos indriyas e remói sem fechar. Dúvida como modo de operação.",
    accent: C.manas,
  }),

  concept("buddhi", 178, 328, {
    devanagari: "बुद्धि",
    iast: "buddhi",
    gloss: "niścayātmikā vṛtti",
    detail:
      "Corta a oscilação com um niścaya — determinação. Não é viveka: é o órgão onde viveka acontece quando está afiado. Superfície mais límpida do antaḥkaraṇa, e por isso onde o reflexo aparece nítido.",
    accent: C.buddhi,
  }),

  concept("ahamkara", 178, 528, {
    devanagari: "अहंकार",
    iast: "ahaṃkāra",
    gloss: "aham + kāra — o fazer do eu",
    detail:
      "Toma a conclusão de buddhi e a carimba como minha. Constrói o jīva como kartṛtva (agente) e bhoktṛtva (fruidor). Sem ele não há agência; hipertrofiado, confunde o ator com o personagem.",
    accent: C.ahamkara,
  }),

  concept("chitta", 520, 328, {
    devanagari: "चित्त",
    iast: "citta",
    gloss: "smaraṇa · saṃskāra",
    detail:
      "O depósito. Memória e impressões latentes que condicionam o que manas sequer chega a considerar. Em Patañjali o termo inverte de peso e nomeia o aparato inteiro — cittavṛttinirodha.",
    accent: C.chitta,
  }),

  concept("atman", -170, 336, {
    devanagari: "आत्मन्",
    iast: "ātman",
    gloss: "caitanya — consciência",
    detail:
      "Não é camada nem parte. Não age, não decide, não lembra. Só ilumina — e o que se toma por 'eu' é o reflexo dessa luz num instrumento.",
    accent: C.atman,
    round: true,
  }),
];

const edge = (
  id: string,
  source: string,
  target: string,
  label: string,
  color: string,
  extra: Partial<Edge> = {}
): Edge => ({
  id,
  source,
  target,
  label,
  type: "smoothstep",
  style: { stroke: color, strokeWidth: 1.6 },
  labelStyle: { fill: "#b9b3a4", fontSize: 11, fontStyle: "italic" },
  labelBgStyle: { fill: "#12110f" },
  labelBgPadding: [6, 3] as [number, number],
  markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
  ...extra,
});

const edges: Edge[] = [
  edge("e1", "indriya", "manas", "viṣaya — o dado", C.indriya),
  edge("e2", "manas", "buddhi", "a dúvida sobe", C.manas),
  edge("e3", "buddhi", "ahamkara", "a decisão é apropriada", C.buddhi),
  edge("e4", "ahamkara", "chitta", "deposita saṃskāra", C.ahamkara, {
    sourceHandle: "r",
    targetHandle: "l",
    animated: true,
    style: { stroke: C.ahamkara, strokeWidth: 1.4, strokeDasharray: "5 4" },
  }),
  edge("e5", "chitta", "manas", "condiciona", C.chitta, {
    sourceHandle: "r",
    targetHandle: "l",
    animated: true,
    style: { stroke: C.chitta, strokeWidth: 1.4, strokeDasharray: "5 4" },
  }),
  edge("e6", "atman", "buddhi", "cidābhāsa — o reflexo", C.atman, {
    sourceHandle: "r",
    targetHandle: "l",
    style: { stroke: C.atman, strokeWidth: 1.2, strokeDasharray: "2 6" },
  }),
];

export default function App() {
  return (
    <div className="shell">
      <header className="hdr">
        <h1>अन्तःकरण</h1>
        <p>
          As camadas do instrumento interno — e o que atravessa todas elas sem
          pertencer a nenhuma.
        </p>
      </header>

      <div className="canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={0.3}
          maxZoom={1.6}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={26}
            size={1}
            color="#2a2825"
          />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      <footer className="ftr">
        <span>
          <b>manas</b> duvida · <b>buddhi</b> resolve · <b>ahaṃkāra</b> se
          apropria · <b>citta</b> guarda
        </span>
        <span className="muted">
          Vedānta às vezes reduz a dois, tratando ahaṃkāra e citta como funções
          de manas e buddhi.
        </span>
      </footer>
    </div>
  );
}
