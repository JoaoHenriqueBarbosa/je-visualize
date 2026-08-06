import type { CollectionSpec } from "./types";
import { samkhya } from "./samkhya";

/** Tudo que já foi pedido para ser visualizado, do mais recente ao mais antigo. */
export const collections: CollectionSpec[] = [samkhya];

export const collectionBySlug = (slug: string) =>
  collections.find((c) => c.slug === slug);

export const flowIn = (collection: CollectionSpec, slug: string) =>
  collection.flows.find((f) => f.slug === slug);
