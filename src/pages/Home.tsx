import { Link } from "react-router-dom";
import { flows } from "../flows";

export default function Home() {
  return (
    <div className="page home">
      <header className="site-head">
        <h1>सांख्य</h1>
        <p className="site-sub">
          Sāṃkhya — o mais antigo dos seis darśanas, e o único que resolve o
          problema contando.
        </p>
        <p className="site-lede">
          Vinte e cinco princípios, três guṇas, três meios de conhecer. Nada de
          criação a partir do nada: o efeito já estava na causa, e o que se
          chama de manifestar é só o que estava implícito ficando explícito.
        </p>
      </header>

      <ul className="flow-list">
        {flows.map((f) => (
          <li key={f.slug}>
            <Link to={`/${f.slug}`} className="flow-card">
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

      <footer className="site-foot">
        Diagramas medidos e posicionados por um motor de layout próprio — o
        esquema declara relações, nunca coordenadas.
      </footer>
    </div>
  );
}
