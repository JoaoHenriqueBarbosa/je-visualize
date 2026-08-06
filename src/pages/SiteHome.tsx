/**
 * A raiz. Sempre theme-root, nunca o tema de uma coleção: este índice não
 * pertence a assunto nenhum e precisa sobreviver a qualquer assunto novo —
 * inclusive um sem grafia nativa, por isso o script do card é condicional.
 *
 * O .wrap interno existe porque o tema é escopado na .page: é ela que pinta
 * o fundo de borda a borda, e a medida de leitura fica no invólucro. Fundir
 * os dois devolve a faixa sem cor que já apareceu uma vez em produção.
 */

import { Link } from "react-router-dom";
import { collections } from "../collections";

export default function SiteHome() {
  return (
    <div className="page site-home theme-root">
      <div className="wrap">
      <header className="root-head">
        <h1>je&#8203;-visualize</h1>
        <p className="root-sub">
          Visualizações construídas sob encomenda. Cada assunto vira um conjunto
          de diagramas com esquema declarado e layout medido.
        </p>
      </header>

      <ul className="coll-list">
        {collections.map((c) => (
          <li key={c.slug}>
            <Link to={`/${c.slug}`} className="coll-card">
              <span className="coll-card-head">
                {c.script && (
                  <span className="coll-card-script">{c.script}</span>
                )}
                <span className="coll-card-title">{c.title}</span>
              </span>
              <span className="coll-card-blurb">{c.blurb}</span>
              <span className="coll-card-meta">
                {c.flows.length}{" "}
                {c.flows.length === 1 ? "diagrama" : "diagramas"}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <footer className="root-foot">
        O esquema declara relações, nunca coordenadas. O motor mede os cartões
        no DOM e decide onde tudo cabe.
      </footer>
      </div>
    </div>
  );
}
