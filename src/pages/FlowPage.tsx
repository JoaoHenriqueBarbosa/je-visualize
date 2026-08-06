/**
 * Página de um diagrama. Resolve coleção e flow pelos dois params da rota;
 * o FlowCanvas faz o resto (medir, posicionar, desenhar).
 *
 * A resolução é em dois passos de propósito — primeiro a coleção, depois o
 * flow DENTRO dela — para que slugs de flow não precisem ser globalmente
 * únicos: /samkhya/guna e uma futura /musica/guna podem coexistir.
 *
 * A página é só o canvas. Título, subtítulo e rodapé moram num painel que o
 * leitor abre quando quer: num diagrama, altura de tela é o recurso escasso
 * e um cabeçalho fixo cobra esse preço em toda visita, inclusive nas em que
 * o texto já foi lido. Sobram dois botões flutuantes — voltar e informações.
 *
 * O painel fica montado mesmo fechado (`inert` + oculto no CSS) para poder
 * animar e para o documento nunca ficar sem o seu h1.
 */

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FlowCanvas from "../flow/FlowCanvas";
import { collectionBySlug, flowIn } from "../collections";

/** Ícones em traço, herdando a cor do botão — nada de cor em JS. */
const IconBack = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
    <path d="M9.5 3.5 5 8l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconInfo = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
    <circle cx="8" cy="8" r="6.1" />
    <path d="M8 7.2v4" strokeLinecap="round" />
    <path d="M8 4.7h.01" strokeLinecap="round" strokeWidth="1.7" />
  </svg>
);

export default function FlowPage() {
  const { collection, slug } = useParams();
  const owner = collection ? collectionBySlug(collection) : undefined;
  const spec = owner && slug ? flowIn(owner, slug) : undefined;

  const [info, setInfo] = useState(false);

  // Esc fecha: o painel cobre parte do desenho, e quem abriu quer o desenho
  // de volta sem procurar o botão.
  useEffect(() => {
    if (!info) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setInfo(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [info]);

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
      <div className="flow-tools">
        <Link
          to={`/${owner.slug}`}
          className="flow-tool"
          aria-label={`voltar para ${owner.title}`}
          title={owner.title}
        >
          <IconBack />
        </Link>
        <button
          type="button"
          className={`flow-tool ${info ? "on" : ""}`}
          aria-label="informações do diagrama"
          aria-expanded={info}
          title="informações"
          onClick={() => setInfo((v) => !v)}
        >
          <IconInfo />
        </button>
      </div>

      <aside className={`flow-info ${info ? "open" : ""}`} inert={!info}>
        <h1>
          <span className="flow-info-script">{spec.script}</span>
          <span className="flow-info-name">{spec.title}</span>
        </h1>
        <p className="flow-info-sub">{spec.subtitle}</p>
        <p className="flow-info-blurb">{spec.blurb}</p>
        {spec.footer && (
          <div className="flow-info-foot">
            {spec.footer.map((line, i) => (
              <span key={i} className={i === 0 ? "" : "muted"}>
                {line}
              </span>
            ))}
          </div>
        )}
      </aside>

      <FlowCanvas spec={spec} />
    </div>
  );
}
