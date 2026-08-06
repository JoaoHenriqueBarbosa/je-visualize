/**
 * A terceira coleção — e a primeira de tema claro: o livro-razão.
 *
 * Não é uma coleção sobre um autor: é sobre a pergunta. As visualizações
 * discordam entre si de propósito — a leitura tradicional do valor como
 * substância produzida, a Nova Leitura (Heinrich, na esteira de Backhaus e
 * Reichelt) do valor como forma constituída na validação monetária, e o
 * confronto direto entre as duas com o mesmo clique de venda.
 */

import type { CollectionSpec } from "./types";
import { teoriaDoValor } from "../flows/valor";
import {
  valorHeinrich,
  produzidoVsConstituido,
  duasVozes,
} from "../flows/heinrich";

export const economia: CollectionSpec = {
  slug: "economia",
  title: "economia",
  blurb:
    "A crítica da economia política em diagramas: o que a troca iguala, de onde vem o valor, e o que o dinheiro tem com isso.",
  subtitle: "a pergunta de dois séculos: o que a troca iguala",
  lede:
    "O valor é a categoria mais disputada da economia política, e esta coleção não escolhe um lado: percorre as respostas. O valor produzido pelo trabalho e contado em horas; o valor constituído na validação social, com o dinheiro como forma e não véu; o confronto entre os dois respondendo ao mesmo clique; e o mapa do próprio debate — onde nenhuma das leituras é dona do texto.",
  footer:
    "Se o dinheiro traduz o valor ou o constitui é exatamente a disputa — as visualizações discordam entre si de propósito.",
  theme: "theme-economia",
  vizes: [teoriaDoValor, valorHeinrich, produzidoVsConstituido, duasVozes],
};
