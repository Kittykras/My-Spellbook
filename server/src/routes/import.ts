import { Router } from "express";
import { z } from "zod";
import { db, transaction } from "../db.ts";
import { getUserId, idSchema, parse } from "../http.ts";
import {
  characterFieldsSchema,
  customSpellInputSchema,
  customWildShapeInputSchema,
  toStoredData,
} from "../schemas.ts";
import { cardTextSchema } from "./cardTexts.ts";
import { loadCharacters } from "./characters.ts";
import { loadCustomSpells } from "./customSpells.ts";
import { loadCustomWildShapes } from "./customWildShapes.ts";

// Shape of what the old version of the app kept in localStorage.
const importSchema = z.object({
  characters: z
    .array(
      characterFieldsSchema.extend({
        id: idSchema,
        classes: characterFieldsSchema.shape.classes.default([]),
        favoriteSpellIds: z.array(idSchema).max(1000).default([]),
        favoriteWildShapeKeys: z.array(idSchema).max(1000).default([]),
      }),
    )
    .max(200)
    .default([]),
  customSpells: z
    .array(customSpellInputSchema.extend({ index: idSchema }))
    .max(2000)
    .default([]),
  customWildShapes: z
    .array(customWildShapeInputSchema.extend({ key: idSchema }))
    .max(2000)
    .default([]),
  cardTexts: z.record(idSchema, cardTextSchema).default({}),
});

export const importRouter = Router();

// Idempotent: rows that already exist (same id) are left untouched, so importing
// the same browser data twice does nothing the second time.
importRouter.post("/", (req, res) => {
  const userId = getUserId(res);
  const data = parse(importSchema, req.body);

  transaction(() => {
    const insertCharacter = db.prepare(
      `INSERT INTO characters (user_id, id, name, classes) VALUES (?, ?, ?, ?)
       ON CONFLICT DO NOTHING`,
    );
    const insertFavoriteSpell = db.prepare(
      `INSERT INTO character_favorite_spells (user_id, character_id, spell_index)
       VALUES (?, ?, ?) ON CONFLICT DO NOTHING`,
    );
    const insertFavoriteWildShape = db.prepare(
      `INSERT INTO character_favorite_wild_shapes (user_id, character_id, wild_shape_key)
       VALUES (?, ?, ?) ON CONFLICT DO NOTHING`,
    );
    for (const character of data.characters) {
      insertCharacter.run(
        userId,
        character.id,
        character.name,
        JSON.stringify(character.classes),
      );
      for (const spellIndex of character.favoriteSpellIds) {
        insertFavoriteSpell.run(userId, character.id, spellIndex);
      }
      for (const key of character.favoriteWildShapeKeys) {
        insertFavoriteWildShape.run(userId, character.id, key);
      }
    }

    const insertSpell = db.prepare(
      `INSERT INTO custom_spells (user_id, id, name, level, data) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT DO NOTHING`,
    );
    for (const spell of data.customSpells) {
      insertSpell.run(userId, spell.index, spell.name, spell.level, toStoredData(spell));
    }

    const insertWildShape = db.prepare(
      `INSERT INTO custom_wild_shapes (user_id, id, name, challenge_rating, data)
       VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
    );
    for (const wildShape of data.customWildShapes) {
      insertWildShape.run(
        userId,
        wildShape.key,
        wildShape.name,
        wildShape.challenge_rating,
        toStoredData(wildShape),
      );
    }

    const insertCardText = db.prepare(
      `INSERT INTO card_texts (user_id, spell_index, text) VALUES (?, ?, ?)
       ON CONFLICT DO NOTHING`,
    );
    for (const [spellIndex, text] of Object.entries(data.cardTexts)) {
      insertCardText.run(userId, spellIndex, text);
    }
  });

  res.json({
    characters: loadCharacters(userId),
    customSpells: loadCustomSpells(userId),
    customWildShapes: loadCustomWildShapes(userId),
  });
});
