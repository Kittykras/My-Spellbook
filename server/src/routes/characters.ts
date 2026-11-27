import { Router } from "express";
import { db } from "../db.ts";
import { HttpError, getUserId, idSchema, parse } from "../http.ts";
import { characterFieldsSchema, newCharacterSchema } from "../schemas.ts";
import type { Character } from "../../../src/types/character.ts";

type CharacterRow = { id: string; name: string; classes: string };

export function loadCharacters(userId: string): Character[] {
  const rows = db
    .prepare(
      "SELECT id, name, classes FROM characters WHERE user_id = ? ORDER BY created_at, rowid",
    )
    .all(userId) as CharacterRow[];

  const favoriteSpells = db
    .prepare(
      "SELECT character_id, spell_index FROM character_favorite_spells WHERE user_id = ? ORDER BY rowid",
    )
    .all(userId) as { character_id: string; spell_index: string }[];

  const favoriteWildShapes = db
    .prepare(
      "SELECT character_id, wild_shape_key FROM character_favorite_wild_shapes WHERE user_id = ? ORDER BY rowid",
    )
    .all(userId) as { character_id: string; wild_shape_key: string }[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    classes: JSON.parse(row.classes),
    favoriteSpellIds: favoriteSpells
      .filter((favorite) => favorite.character_id === row.id)
      .map((favorite) => favorite.spell_index),
    favoriteWildShapeKeys: favoriteWildShapes
      .filter((favorite) => favorite.character_id === row.id)
      .map((favorite) => favorite.wild_shape_key),
  }));
}

function assertCharacterExists(userId: string, characterId: string) {
  const row = db
    .prepare("SELECT 1 FROM characters WHERE user_id = ? AND id = ?")
    .get(userId, characterId);
  if (!row) throw new HttpError(404, "Character not found");
}

export const charactersRouter = Router();

charactersRouter.get("/", (_req, res) => {
  res.json(loadCharacters(getUserId(res)));
});

charactersRouter.post("/", (req, res) => {
  const userId = getUserId(res);
  const { id, name, classes } = parse(newCharacterSchema, req.body);

  const result = db
    .prepare(
      `INSERT INTO characters (user_id, id, name, classes) VALUES (?, ?, ?, ?)
       ON CONFLICT DO NOTHING`,
    )
    .run(userId, id, name, JSON.stringify(classes));
  if (result.changes === 0) {
    throw new HttpError(409, "A character with that id already exists");
  }

  const character: Character = {
    id,
    name,
    classes,
    favoriteSpellIds: [],
    favoriteWildShapeKeys: [],
  };
  res.status(201).json(character);
});

charactersRouter.patch("/:id", (req, res) => {
  const userId = getUserId(res);
  const id = parse(idSchema, req.params.id);
  const changes = parse(characterFieldsSchema.partial(), req.body);

  assertCharacterExists(userId, id);
  if (changes.name !== undefined) {
    db.prepare("UPDATE characters SET name = ? WHERE user_id = ? AND id = ?").run(
      changes.name,
      userId,
      id,
    );
  }
  if (changes.classes !== undefined) {
    db.prepare(
      "UPDATE characters SET classes = ? WHERE user_id = ? AND id = ?",
    ).run(JSON.stringify(changes.classes), userId, id);
  }

  res.json(loadCharacters(userId).find((character) => character.id === id));
});

charactersRouter.delete("/:id", (req, res) => {
  const userId = getUserId(res);
  const id = parse(idSchema, req.params.id);
  const result = db
    .prepare("DELETE FROM characters WHERE user_id = ? AND id = ?")
    .run(userId, id);
  if (result.changes === 0) throw new HttpError(404, "Character not found");
  res.status(204).end();
});

const favoriteTables = {
  "favorite-spells": { table: "character_favorite_spells", column: "spell_index" },
  "favorite-wild-shapes": {
    table: "character_favorite_wild_shapes",
    column: "wild_shape_key",
  },
} as const;

for (const [path, { table, column }] of Object.entries(favoriteTables)) {
  charactersRouter.put(`/:id/${path}/:value`, (req, res) => {
    const userId = getUserId(res);
    const characterId = parse(idSchema, req.params.id);
    const value = parse(idSchema, req.params.value);

    assertCharacterExists(userId, characterId);
    db.prepare(
      `INSERT INTO ${table} (user_id, character_id, ${column}) VALUES (?, ?, ?)
       ON CONFLICT DO NOTHING`,
    ).run(userId, characterId, value);
    res.status(204).end();
  });

  charactersRouter.delete(`/:id/${path}/:value`, (req, res) => {
    const userId = getUserId(res);
    const characterId = parse(idSchema, req.params.id);
    const value = parse(idSchema, req.params.value);

    assertCharacterExists(userId, characterId);
    db.prepare(
      `DELETE FROM ${table} WHERE user_id = ? AND character_id = ? AND ${column} = ?`,
    ).run(userId, characterId, value);
    res.status(204).end();
  });
}
