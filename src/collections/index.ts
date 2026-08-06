/**
 * O único cadastro manual do site.
 *
 * Registrar uma coleção aqui é o passo final de criá-la: rotas, home e
 * auditoria derivam tudo deste array — nada mais precisa saber que ela
 * existe. A ordem do array é a ordem da home, e é ordem de chegada:
 * sāṃkhya primeiro por ser o fundador.
 */

import type { CollectionSpec } from "./types";
import { samkhya } from "./samkhya";
import { eletronica } from "./eletronica";
import { economia } from "./economia";

/** Tudo que já foi pedido para ser visualizado, em ordem de chegada. */
export const collections: CollectionSpec[] = [samkhya, eletronica, economia];

export const collectionBySlug = (slug: string) =>
  collections.find((c) => c.slug === slug);

export const vizIn = (collection: CollectionSpec, slug: string) =>
  collection.vizes.find((v) => v.slug === slug);
