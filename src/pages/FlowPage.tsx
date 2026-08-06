/**
 * Página de um diagrama. Resolve coleção e flow pelos dois params da rota;
 * o FlowCanvas faz o resto (medir, posicionar, desenhar).
 *
 * A resolução é em dois passos de propósito — primeiro a coleção, depois o
 * flow DENTRO dela — para que slugs de flow não precisem ser globalmente
 * únicos: /samkhya/guna e uma futura /musica/guna podem coexistir.
 */

import { Link, useParams } from "react-router-dom";
import FlowCanvas from "../flow/FlowCanvas";
import { collectionBySlug, flowIn } from "../collections";

export default function FlowPage() {
  const { collection, slug } = useParams();
  const owner = collection ? collectionBySlug(collection) : undefined;
  const spec = owner && slug ? flowIn(owner, slug) : undefined;

  if (!owner || !spec) {
    return (
      <div className="page missing theme-root">
        <p>Não há diagrama com esse nome.</p>
        <Link to={owner ? `/${owner.slug}` : "/"} className="back">
          voltar
        </Link>
      </div>
    );
  }

  return (
    <div className={`page flow-page ${owner.theme}`}>
      <header className="flow-head">
        <Link to={`/${owner.slug}`} className="back">
          ← {owner.title}
        </Link>
        <h1>
          <span className="flow-head-script">{spec.script}</span>
          <span className="flow-head-name">{spec.title}</span>
        </h1>
        <p>{spec.subtitle}</p>
      </header>

      <FlowCanvas spec={spec} />

      {spec.footer && (
        <footer className="flow-foot">
          {spec.footer.map((line, i) => (
            <span key={i} className={i === 0 ? "" : "muted"}>
              {line}
            </span>
          ))}
        </footer>
      )}
    </div>
  );
}
