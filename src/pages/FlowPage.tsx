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
