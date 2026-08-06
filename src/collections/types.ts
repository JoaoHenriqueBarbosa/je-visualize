import type { FlowSpec } from "../flow/types";

/**
 * Uma coleção é um assunto que alguém pediu para ser visualizado.
 *
 * O nível acima do flow: o flow é um diagrama, a coleção é o corpo de
 * diagramas que cobre um assunto inteiro. A home do site lista coleções e
 * não sabe nada sobre o que há dentro delas — é isso que deixa o próximo
 * assunto entrar sem tocar em nada do anterior.
 *
 * Rotas derivam daqui: `/:collection` e `/:collection/:flow`.
 */
export interface CollectionSpec {
  slug: string;
  /** Nome curto, no registro do próprio assunto. */
  title: string;
  /** Grafia nativa, se houver. Opcional: nem todo assunto tem uma. */
  devanagari?: string;
  /** Uma linha, no cartão da home. */
  blurb: string;
  /** Subtítulo da página da coleção. */
  subtitle: string;
  /** Parágrafo de abertura da página da coleção. */
  lede?: string;
  /** Nota de rodapé da página da coleção. */
  footer?: string;
  /** Em ordem de leitura sugerida. */
  flows: FlowSpec[];
}
