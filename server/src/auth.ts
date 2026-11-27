import { Router, type RequestHandler, type Response } from "express";
import {
  createHash,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { z } from "zod";
import { db } from "./db.ts";
import { HttpError, getUserId, parse } from "./http.ts";

const SESSION_COOKIE = "spellbook_session";
const SESSION_DAYS = 30;
const SCRYPT_KEYLEN = 64;

function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(expected, actual);
}

// Only a hash of the token is stored, so a leaked database can't be used to hijack sessions.
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function startSession(res: Response, userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(
    new Date().toISOString(),
  );
  db.prepare(
    "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
  ).run(hashToken(token), userId, expiresAt.toISOString());

  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

function findSessionUser(token: unknown) {
  if (typeof token !== "string" || !token) return undefined;
  return db
    .prepare(
      `SELECT users.id, users.email FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ? AND sessions.expires_at > ?`,
    )
    .get(hashToken(token), new Date().toISOString()) as
    | { id: string; email: string }
    | undefined;
}

export const requireUser: RequestHandler = (req, res, next) => {
  const user = findSessionUser(req.cookies?.[SESSION_COOKIE]);
  if (!user) {
    throw new HttpError(401, "Not logged in");
  }
  res.locals.userId = user.id;
  res.locals.email = user.email;
  next();
};

const credentialsSchema = z.object({
  email: z.email().trim().toLowerCase().max(254),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export const authRouter = Router();

authRouter.post("/register", (req, res) => {
  const { email, password } = parse(credentialsSchema, req.body);

  const existing = db.prepare("SELECT 1 FROM users WHERE email = ?").get(email);
  if (existing) {
    throw new HttpError(409, "An account with that email already exists");
  }

  const id = randomUUID();
  db.prepare(
    "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)",
  ).run(id, email, hashPassword(password));

  startSession(res, id);
  res.status(201).json({ id, email });
});

authRouter.post("/login", (req, res) => {
  const { email, password } = parse(
    credentialsSchema.extend({ password: z.string().min(1).max(200) }),
    req.body,
  );

  const user = db
    .prepare("SELECT id, email, password_hash FROM users WHERE email = ?")
    .get(email) as { id: string; email: string; password_hash: string } | undefined;

  if (!user || !verifyPassword(password, user.password_hash)) {
    throw new HttpError(401, "Wrong email or password");
  }

  startSession(res, user.id);
  res.json({ id: user.id, email: user.email });
});

authRouter.post("/logout", (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token === "string") {
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  }
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.status(204).end();
});

authRouter.get("/me", requireUser, (_req, res) => {
  res.json({ id: getUserId(res), email: res.locals.email });
});
