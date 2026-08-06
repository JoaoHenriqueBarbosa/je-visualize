/**
 * Página de uma coleção: cabeçalho com a voz do assunto e a grade de cards
 * dos diagramas. Todo o conteúdo vem do CollectionSpec — este componente
 * não sabe nada de sāṃkhya nem de eletrônica, e é essa ignorância que deixa
 * a próxima coleção entrar sem tocar aqui.
 *
 * O tema da coleção (spec.theme) entra como classe na .page; a rota de erro
 * cai em theme-root porque não há coleção de quem herdar aparência.
 */

import { Link, useParams } from "react-router-dom";
import { collectionBySlug } from "../collections";
import { vizMeta } from "../viz/types";

export default function CollectionPage() {
  const { collection } = useParams();
  const spec = collection ? collectionBySlug(collection) : undefined;

  if (!spec) {
    return (
      <div className="page missing theme-root">
        <p>Não há visualização com esse nome.</p>
        <Link to="/" className="back">
          voltar
        </Link>
      </div>
    );
  }

  return (
    <div className={`page home ${spec.theme}`}>
      <div className="wrap">
      <header className="site-head">
        <Link to="/" className="back">
          ← je-visualize
        </Link>
        {spec.script && <h1>{spec.script}</h1>}
        <p className="site-sub">
          {spec.title} — {spec.subtitle}
        </p>
        {spec.lede && <p className="site-lede">{spec.lede}</p>}
      </header>

      <ul className="flow-list">
        {spec.vizes.map((f) => (
          <li key={f.slug}>
            <Link to={`/${spec.slug}/${f.slug}`} className="flow-card">
              <span className="flow-card-script">{f.script}</span>
              <span className="flow-card-title">{f.title}</span>
              <span className="flow-card-blurb">{f.blurb}</span>
              <span className="flow-card-meta">{vizMeta(f)}</span>
            </Link>
          </li>
        ))}
      </ul>

      {spec.footer && <footer className="site-foot">{spec.footer}</footer>}
      </div>
    </div>
  );
}
