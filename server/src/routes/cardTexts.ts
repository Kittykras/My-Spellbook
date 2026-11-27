import { Router } from "express";
import { z } from "zod";
import { db } from "../db.ts";
import { getUserId, idSchema, parse } from "../http.ts";

export const cardTextSchema = z.string().trim().min(1).max(5000);

export const cardTextsRouter = Router();

cardTextsRouter.get("/", (_req, res) => {
  const rows = db
    .prepare("SELECT spell_index, text FROM card_texts WHERE user_id = ?")
    .all(getUserId(res)) as { spell_index: string; text: string }[];
  res.json(Object.fromEntries(rows.map((row) => [row.spell_index, row.text])));
});

cardTextsRouter.put("/:spellIndex", (req, res) => {
  const userId = getUserId(res);
  const spellIndex = parse(idSchema, req.params.spellIndex);
  const { text } = parse(z.object({ text: cardTextSchema }), req.body);

  db.prepare(
    `INSERT INTO card_texts (user_id, spell_index, text) VALUES (?, ?, ?)
     ON CONFLICT (user_id, spell_index) DO UPDATE SET text = excluded.text`,
  ).run(userId, spellIndex, text);
  res.json({ spellIndex, text });
});

cardTextsRouter.delete("/:spellIndex", (req, res) => {
  const userId = getUserId(res);
  const spellIndex = parse(idSchema, req.params.spellIndex);
  db.prepare("DELETE FROM card_texts WHERE user_id = ? AND spell_index = ?").run(
    userId,
    spellIndex,
  );
  res.status(204).end();
});
