import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import ConceptCard, { type CardState } from "./ConceptCard";
import type { NodeSpec, Side } from "./types";

const SIDES: { id: Side; pos: Position }[] = [
  { id: "t", pos: Position.Top },
  { id: "b", pos: Position.Bottom },
  { id: "l", pos: Position.Left },
  { id: "r", pos: Position.Right },
];

export type ConceptNodeType = Node<
  { node: NodeSpec; state?: CardState },
  "concept"
>;

/**
 * Quatro âncoras de entrada e quatro de saída em cada nó. O motor escolhe
 * qual usar a partir da geometria final, então uma aresta nunca precisa
 * atravessar o cartão para chegar do outro lado.
 */
export function ConceptNode({ data }: NodeProps<ConceptNodeType>) {
  return (
    <>
      {SIDES.map((s) => (
        <Handle
          key={`s-${s.id}`}
          id={`s-${s.id}`}
          type="source"
          position={s.pos}
          className="anchor"
        />
      ))}
      {SIDES.map((s) => (
        <Handle
          key={`t-${s.id}`}
          id={`t-${s.id}`}
          type="target"
          position={s.pos}
          className="anchor"
        />
      ))}
      <ConceptCard node={data.node} state={data.state} />
    </>
  );
}

export type GroupNodeType = Node<{ label: string; sub?: string }, "group">;

export function GroupNode({ data }: NodeProps<GroupNodeType>) {
  return (
    <div className="group-frame">
      <div className="group-legend">
        <span className="group-legend-name">{data.label}</span>
        {data.sub && <span className="group-legend-sub">{data.sub}</span>}
      </div>
    </div>
  );
}

export const nodeTypes = { concept: ConceptNode, group: GroupNode };
