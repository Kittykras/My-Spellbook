import { Router } from "express";
import { db, transaction } from "../db.ts";
import { HttpError, getUserId, idSchema, parse } from "../http.ts";
import { customWildShapeInputSchema, toStoredData } from "../schemas.ts";
import type { CustomWildShape } from "../../../src/types/wildShape.ts";

type Row = { id: string; data: string };

function toCustomWildShape(row: Row): CustomWildShape {
  return { ...JSON.parse(row.data), key: row.id, isCustom: true };
}

export function loadCustomWildShapes(userId: string): CustomWildShape[] {
  const rows = db
    .prepare(
      "SELECT id, data FROM custom_wild_shapes WHERE user_id = ? ORDER BY created_at, rowid",
    )
    .all(userId) as Row[];
  return rows.map(toCustomWildShape);
}

export const customWildShapesRouter = Router();

customWildShapesRouter.get("/", (_req, res) => {
  res.json(loadCustomWildShapes(getUserId(res)));
});

customWildShapesRouter.post("/", (req, res) => {
  const userId = getUserId(res);
  const key = parse(idSchema, req.body?.key);
  const input = parse(customWildShapeInputSchema, req.body);

  const result = db
    .prepare(
      `INSERT INTO custom_wild_shapes (user_id, id, name, challenge_rating, data)
       VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
    )
    .run(userId, key, input.name, input.challenge_rating, toStoredData(input));
  if (result.changes === 0) {
    throw new HttpError(409, "A custom wild shape with that key already exists");
  }

  res.status(201).json(toCustomWildShape({ id: key, data: toStoredData(input) }));
});

customWildShapesRouter.put("/:id", (req, res) => {
  const userId = getUserId(res);
  const id = parse(idSchema, req.params.id);
  const input = parse(customWildShapeInputSchema, req.body);

  const result = db
    .prepare(
      `UPDATE custom_wild_shapes
       SET name = ?, challenge_rating = ?, data = ?, updated_at = datetime('now')
       WHERE user_id = ? AND id = ?`,
    )
    .run(input.name, input.challenge_rating, toStoredData(input), userId, id);
  if (result.changes === 0) throw new HttpError(404, "Custom wild shape not found");

  res.json(toCustomWildShape({ id, data: toStoredData(input) }));
});

customWildShapesRouter.delete("/:id", (req, res) => {
  const userId = getUserId(res);
  const id = parse(idSchema, req.params.id);

  const deleted = transaction(() => {
    const result = db
      .prepare("DELETE FROM custom_wild_shapes WHERE user_id = ? AND id = ?")
      .run(userId, id);
    db.prepare(
      "DELETE FROM character_favorite_wild_shapes WHERE user_id = ? AND wild_shape_key = ?",
    ).run(userId, id);
    return result.changes;
  });
  if (deleted === 0) throw new HttpError(404, "Custom wild shape not found");

  res.status(204).end();
});
