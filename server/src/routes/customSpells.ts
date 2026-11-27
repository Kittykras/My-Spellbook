import { Router } from "express";
import { db, transaction } from "../db.ts";
import { HttpError, getUserId, idSchema, parse } from "../http.ts";
import { customSpellInputSchema, toStoredData } from "../schemas.ts";
import type { CustomSpell } from "../../../src/types/spell.ts";

type Row = { id: string; data: string; is_shared: number; is_own: number };

function toCustomSpell(row: Row): CustomSpell {
  return {
    ...JSON.parse(row.data),
    index: row.id,
    isCustom: true,
    isFavorite: false,
    isShared: row.is_shared === 1,
    isOwn: row.is_own === 1,
  };
}

// The user's own custom spells plus every spell other users have shared.
export function loadCustomSpells(userId: string): CustomSpell[] {
  const rows = db
    .prepare(
      `SELECT id, data, is_shared, (user_id = ?) AS is_own FROM custom_spells
       WHERE user_id = ? OR is_shared = 1
       ORDER BY created_at, rowid`,
    )
    .all(userId, userId) as Row[];
  return rows.map(toCustomSpell);
}

export const customSpellsRouter = Router();

customSpellsRouter.get("/", (_req, res) => {
  res.json(loadCustomSpells(getUserId(res)));
});

customSpellsRouter.post("/", (req, res) => {
  const userId = getUserId(res);
  const index = parse(idSchema, req.body?.index);
  const input = parse(customSpellInputSchema, req.body);
  const isShared = input.isShared ? 1 : 0;
  const data = toStoredData(input);

  // ON CONFLICT also covers an id already used by another user (unique index).
  const result = db
    .prepare(
      `INSERT INTO custom_spells (user_id, id, name, level, data, is_shared)
       VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
    )
    .run(userId, index, input.name, input.level, data, isShared);
  if (result.changes === 0) {
    throw new HttpError(409, "A custom spell with that index already exists");
  }

  res
    .status(201)
    .json(toCustomSpell({ id: index, data, is_shared: isShared, is_own: 1 }));
});

// Only the owner can edit; shared spells from others are read-only (404 here).
customSpellsRouter.put("/:id", (req, res) => {
  const userId = getUserId(res);
  const id = parse(idSchema, req.params.id);
  const input = parse(customSpellInputSchema, req.body);
  const isShared = input.isShared ? 1 : 0;
  const data = toStoredData(input);

  const result = db
    .prepare(
      `UPDATE custom_spells
       SET name = ?, level = ?, data = ?, is_shared = ?, updated_at = datetime('now')
       WHERE user_id = ? AND id = ?`,
    )
    .run(input.name, input.level, data, isShared, userId, id);
  if (result.changes === 0) throw new HttpError(404, "Custom spell not found");

  res.json(toCustomSpell({ id, data, is_shared: isShared, is_own: 1 }));
});

customSpellsRouter.delete("/:id", (req, res) => {
  const userId = getUserId(res);
  const id = parse(idSchema, req.params.id);

  const deleted = transaction(() => {
    const result = db
      .prepare("DELETE FROM custom_spells WHERE user_id = ? AND id = ?")
      .run(userId, id);
    if (result.changes === 0) return 0;

    // The spell may have been shared, so clean up every user's references to it.
    db.prepare("DELETE FROM character_favorite_spells WHERE spell_index = ?").run(id);
    db.prepare("DELETE FROM card_texts WHERE spell_index = ?").run(id);
    return result.changes;
  });
  if (deleted === 0) throw new HttpError(404, "Custom spell not found");

  res.status(204).end();
});
