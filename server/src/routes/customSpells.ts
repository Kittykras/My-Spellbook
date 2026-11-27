import { Router } from "express";
import { db, transaction } from "../db.ts";
import { HttpError, getUserId, idSchema, parse } from "../http.ts";
import { customSpellInputSchema, toStoredData } from "../schemas.ts";
import type { CustomSpell } from "../../../src/types/spell.ts";

type Row = { id: string; data: string };

function toCustomSpell(row: Row): CustomSpell {
  return { ...JSON.parse(row.data), index: row.id, isCustom: true, isFavorite: false };
}

export function loadCustomSpells(userId: string): CustomSpell[] {
  const rows = db
    .prepare(
      "SELECT id, data FROM custom_spells WHERE user_id = ? ORDER BY created_at, rowid",
    )
    .all(userId) as Row[];
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

  const result = db
    .prepare(
      `INSERT INTO custom_spells (user_id, id, name, level, data) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT DO NOTHING`,
    )
    .run(userId, index, input.name, input.level, toStoredData(input));
  if (result.changes === 0) {
    throw new HttpError(409, "A custom spell with that index already exists");
  }

  res.status(201).json(toCustomSpell({ id: index, data: toStoredData(input) }));
});

customSpellsRouter.put("/:id", (req, res) => {
  const userId = getUserId(res);
  const id = parse(idSchema, req.params.id);
  const input = parse(customSpellInputSchema, req.body);

  const result = db
    .prepare(
      `UPDATE custom_spells SET name = ?, level = ?, data = ?, updated_at = datetime('now')
       WHERE user_id = ? AND id = ?`,
    )
    .run(input.name, input.level, toStoredData(input), userId, id);
  if (result.changes === 0) throw new HttpError(404, "Custom spell not found");

  res.json(toCustomSpell({ id, data: toStoredData(input) }));
});

customSpellsRouter.delete("/:id", (req, res) => {
  const userId = getUserId(res);
  const id = parse(idSchema, req.params.id);

  const deleted = transaction(() => {
    const result = db
      .prepare("DELETE FROM custom_spells WHERE user_id = ? AND id = ?")
      .run(userId, id);
    db.prepare(
      "DELETE FROM character_favorite_spells WHERE user_id = ? AND spell_index = ?",
    ).run(userId, id);
    db.prepare("DELETE FROM card_texts WHERE user_id = ? AND spell_index = ?").run(
      userId,
      id,
    );
    return result.changes;
  });
  if (deleted === 0) throw new HttpError(404, "Custom spell not found");

  res.status(204).end();
});
