import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

export type ConceptData = {
  devanagari: string;
  iast: string;
  gloss: string;
  detail: string;
  accent: string;
  round?: boolean;
};

export type ConceptNodeType = Node<ConceptData, "concept">;

export default function ConceptNode({ data }: NodeProps<ConceptNodeType>) {
  return (
    <div
      className="concept"
      style={{
        borderColor: data.accent,
        borderRadius: data.round ? "50% / 40%" : "3px",
      }}
    >
      <Handle type="target" position={Position.Top} className="hdl" />
      <Handle type="target" position={Position.Left} id="l" className="hdl" />
      <Handle type="source" position={Position.Right} id="r" className="hdl" />
      <Handle type="source" position={Position.Bottom} className="hdl" />

      <div className="deva" style={{ color: data.accent }}>
        {data.devanagari}
      </div>
      <div className="iast">{data.iast}</div>
      <div className="gloss">{data.gloss}</div>
      <div className="detail">{data.detail}</div>
    </div>
  );
}
