import type { Node, NodeProps } from "@xyflow/react";

export type FieldData = { label: string; sub: string };
export type FieldNodeType = Node<FieldData, "field">;

export default function FieldNode({ data }: NodeProps<FieldNodeType>) {
  return (
    <div className="field">
      <div className="field-tag">
        <span className="field-name">{data.label}</span>
        <span className="field-sub">{data.sub}</span>
      </div>
    </div>
  );
}
