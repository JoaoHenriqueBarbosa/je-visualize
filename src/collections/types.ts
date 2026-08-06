import type { VizSpec } from "../viz/types";

/**
 * Uma coleção é um assunto que alguém pediu para ser visualizado.
 *
 * O nível acima da visualização: a visualização é uma página (um flow, uma
 * máquina, uma tabela — o que o assunto pedir), a coleção é o corpo delas
 * que cobre um assunto inteiro. A home do site lista coleções e não sabe
 * nada sobre o que há dentro delas — é isso que deixa o próximo assunto
 * entrar sem tocar em nada do anterior.
 *
 * Rotas derivam daqui: `/:collection` e `/:collection/:viz`.
 */
export interface CollectionSpec {
  slug: string;
  /** Nome curto, no registro do próprio assunto. */
  title: string;
  /** Grafia nativa, se houver. Opcional: nem todo assunto tem uma. */
  script?: string;
  /** Uma linha, no cartão da home. */
  blurb: string;
  /** Subtítulo da página da coleção. */
  subtitle: string;
  /** Parágrafo de abertura da página da coleção. */
  lede?: string;
  /** Nota de rodapé da página da coleção. */
  footer?: string;
  /**
   * Classe de tema aplicada na raiz das páginas desta coleção.
   * O arquivo vive em `src/styles/themes/`. Cor e tipografia são dele;
   * tamanho é global. Duas coleções podem não parecer nada uma com a outra.
   */
  theme: string;
  /** As visualizações, em ordem de leitura sugerida. */
  vizes: VizSpec[];
}
