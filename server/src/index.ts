import express from "express";
import cookieParser from "cookie-parser";
import "./db.ts";
import { authRouter, requireUser } from "./auth.ts";
import { errorHandler } from "./http.ts";
import { charactersRouter } from "./routes/characters.ts";
import { customSpellsRouter } from "./routes/customSpells.ts";
import { customWildShapesRouter } from "./routes/customWildShapes.ts";
import { cardTextsRouter } from "./routes/cardTexts.ts";
import { importRouter } from "./routes/import.ts";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.disable("x-powered-by");
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/characters", requireUser, charactersRouter);
app.use("/api/custom-spells", requireUser, customSpellsRouter);
app.use("/api/custom-wild-shapes", requireUser, customWildShapesRouter);
app.use("/api/card-texts", requireUser, cardTextsRouter);
app.use("/api/import", requireUser, importRouter);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});
app.use(errorHandler);

app.listen(port, () => {
  console.log(`My Spellbook API listening on http://localhost:${port}`);
});
