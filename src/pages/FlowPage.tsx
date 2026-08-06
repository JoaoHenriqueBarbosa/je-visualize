import { Link, useParams } from "react-router-dom";
import FlowCanvas from "../flow/FlowCanvas";
import { flowBySlug } from "../flows";

export default function FlowPage() {
  const { slug } = useParams();
  const spec = slug ? flowBySlug(slug) : undefined;

  if (!spec) {
    return (
      <div className="page missing">
        <p>Não há flow com esse nome.</p>
        <Link to="/" className="back">
          voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="page flow-page">
      <header className="flow-head">
        <Link to="/" className="back">
          ← sāṃkhya
        </Link>
        <h1>
          <span className="flow-head-deva">{spec.devanagari}</span>
          <span className="flow-head-iast">{spec.title}</span>
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
