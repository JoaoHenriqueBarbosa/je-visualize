/**
 * O comparativo: dois (ou mais) flows lado a lado com os inputs
 * compartilhados por id. Alternar A num lado alterna nos dois; cada lado
 * avalia seus próprios computes — a diferença entre as respostas é o
 * conteúdo da página.
 *
 * Cada lado é um FlowCanvas completo (medição, layout, simulação), com
 * `urlSync` desligado: o dono do estado e da URL é o useSharedSim daqui.
 * O cabeçalho de cada lado é a única moldura extra — centrado para não
 * disputar com os botões flutuantes da página.
 */

import FlowCanvas from "../flow/FlowCanvas";
import { useSharedSim } from "./sim";
import type { CompareSpec } from "./types";

export default function CompareCanvas({ spec }: { spec: CompareSpec }) {
  const shared = useSharedSim(spec.sides);

  return (
    <div className="compare">
      {spec.sides.map((side) => (
        <section key={side.slug} className="compare-side">
          <header className="compare-side-head">
            {side.script && (
              <span className="compare-side-script">{side.script}</span>
            )}
            <span className="compare-side-name">{side.title}</span>
          </header>
          <FlowCanvas spec={side} shared={shared} urlSync={false} />
        </section>
      ))}
    </div>
  );
}
