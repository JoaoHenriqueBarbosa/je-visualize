/**
 * O ciclo: anel + centro opcional, layout polar, todo o resto do FlowCanvas
 * de graça (medição, simulação, foco, temas). O spec declara ordem, nunca
 * ângulo — a ordem do array é a topologia, e o raio sai das medidas.
 */

import { useMemo } from "react";
import FlowCanvas from "../flow/FlowCanvas";
import type { FlowSpec } from "../flow/types";
import { layoutPolar } from "./layouts/polar";
import type { CycleSpec } from "./types";

export default function CycleCanvas({ spec }: { spec: CycleSpec }) {
  const flow: FlowSpec = useMemo(
    () => ({
      slug: spec.slug,
      title: spec.title,
      subtitle: spec.subtitle,
      blurb: spec.blurb,
      nodes: [...(spec.center ? [spec.center] : []), ...spec.ring],
      edges: spec.edges,
    }),
    [spec]
  );

  const layoutFn = useMemo(
    () => layoutPolar(spec.center?.id),
    [spec.center?.id]
  );

  return <FlowCanvas spec={flow} layoutFn={layoutFn} />;
}
