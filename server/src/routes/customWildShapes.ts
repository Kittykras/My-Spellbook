import { Router } from "express";
import { db, transaction } from "../db.ts";
import { HttpError, getUserId, idSchema, parse } from "../http.ts";
import { customWildShapeInputSchema, toStoredData } from "../schemas.ts";
import type { CustomWildShape } from "../../../src/types/wildShape.ts";

type Row = { id: string; data: string; is_shared: number; is_own: number };

function toCustomWildShape(row: Row): CustomWildShape {
  return {
    ...JSON.parse(row.data),
    key: row.id,
    isCustom: true,
    isShared: row.is_shared === 1,
    isOwn: row.is_own === 1,
  };
}

// The user's own custom wild shapes plus every wild shape other users have shared.
export function loadCustomWildShapes(userId: string): CustomWildShape[] {
  const rows = db
    .prepare(
      `SELECT id, data, is_shared, (user_id = ?) AS is_own FROM custom_wild_shapes
       WHERE user_id = ? OR is_shared = 1
       ORDER BY created_at, rowid`,
    )
    .all(userId, userId) as Row[];
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
  const isShared = input.isShared ? 1 : 0;
  const data = toStoredData(input);

  // ON CONFLICT also covers a key already used by another user (unique index).
  const result = db
    .prepare(
      `INSERT INTO custom_wild_shapes (user_id, id, name, challenge_rating, data, is_shared)
       VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
    )
    .run(userId, key, input.name, input.challenge_rating, data, isShared);
  if (result.changes === 0) {
    throw new HttpError(409, "A custom wild shape with that key already exists");
  }

  res
    .status(201)
    .json(toCustomWildShape({ id: key, data, is_shared: isShared, is_own: 1 }));
});

// Only the owner can edit; shared wild shapes from others are read-only (404 here).
customWildShapesRouter.put("/:id", (req, res) => {
  const userId = getUserId(res);
  const id = parse(idSchema, req.params.id);
  const input = parse(customWildShapeInputSchema, req.body);
  const isShared = input.isShared ? 1 : 0;
  const data = toStoredData(input);

  const result = db
    .prepare(
      `UPDATE custom_wild_shapes
       SET name = ?, challenge_rating = ?, data = ?, is_shared = ?, updated_at = datetime('now')
       WHERE user_id = ? AND id = ?`,
    )
    .run(input.name, input.challenge_rating, data, isShared, userId, id);
  if (result.changes === 0) throw new HttpError(404, "Custom wild shape not found");

  res.json(toCustomWildShape({ id, data, is_shared: isShared, is_own: 1 }));
});

customWildShapesRouter.delete("/:id", (req, res) => {
  const userId = getUserId(res);
  const id = parse(idSchema, req.params.id);

  const deleted = transaction(() => {
    const result = db
      .prepare("DELETE FROM custom_wild_shapes WHERE user_id = ? AND id = ?")
      .run(userId, id);
    if (result.changes === 0) return 0;

    // The wild shape may have been shared, so remove it from every user's favorites.
    db.prepare(
      "DELETE FROM character_favorite_wild_shapes WHERE wild_shape_key = ?",
    ).run(id);
    return result.changes;
  });
  if (deleted === 0) throw new HttpError(404, "Custom wild shape not found");

  res.status(204).end();
});
