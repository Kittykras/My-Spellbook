import { z } from "zod";
import { idSchema } from "./http.ts";

export const characterFieldsSchema = z.object({
  name: z.string().trim().min(1).max(100),
  classes: z.array(z.string().trim().min(1).max(50)).max(20),
});

export const newCharacterSchema = characterFieldsSchema.extend({ id: idSchema });

// The custom spell / wild shape forms produce many nested fields that are only
// ever displayed, so those are stored as a JSON blob. We validate the fields the
// database indexes on and allow the rest through (bounded by the body size limit).
export const customSpellInputSchema = z.looseObject({
  name: z.string().trim().min(1).max(200),
  level: z.number().int().min(0).max(9),
  description: z.string().max(20000).optional(),
  classes: z.array(z.string().max(50)).max(20).optional(),
  components: z.array(z.string().max(20)).max(10).optional(),
  isShared: z.boolean().optional(),
});

export const customWildShapeInputSchema = z.looseObject({
  name: z.string().trim().min(1).max(200),
  challenge_rating: z.number().min(0).max(30),
  isShared: z.boolean().optional(),
});

// Fields that are derived on read and must never be stored inside `data`.
// (`isShared` has its own column.)
const DERIVED_FIELDS = [
  "index",
  "key",
  "isCustom",
  "isFavorite",
  "isShared",
  "isOwn",
];

export function toStoredData(input: Record<string, unknown>): string {
  const copy = { ...input };
  for (const field of DERIVED_FIELDS) delete copy[field];
  return JSON.stringify(copy);
}
