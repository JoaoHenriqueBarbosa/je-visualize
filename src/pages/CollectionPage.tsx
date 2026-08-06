import { Link, useParams } from "react-router-dom";
import { collectionBySlug } from "../collections";

export default function CollectionPage() {
  const { collection } = useParams();
  const spec = collection ? collectionBySlug(collection) : undefined;

  if (!spec) {
    return (
      <div className="page missing">
        <p>Não há visualização com esse nome.</p>
        <Link to="/" className="back">
          voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="page home">
      <header className="site-head">
        <Link to="/" className="back">
          ← je-visualize
        </Link>
        {spec.devanagari && <h1>{spec.devanagari}</h1>}
        <p className="site-sub">
          {spec.title} — {spec.subtitle}
        </p>
        {spec.lede && <p className="site-lede">{spec.lede}</p>}
      </header>

      <ul className="flow-list">
        {spec.flows.map((f) => (
          <li key={f.slug}>
            <Link to={`/${spec.slug}/${f.slug}`} className="flow-card">
              <span className="flow-card-deva">{f.devanagari}</span>
              <span className="flow-card-title">{f.title}</span>
              <span className="flow-card-blurb">{f.blurb}</span>
              <span className="flow-card-meta">
                {f.nodes.length} princípios · {f.edges.length} relações
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {spec.footer && <footer className="site-foot">{spec.footer}</footer>}
    </div>
  );
}
