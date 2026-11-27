# My Spellbook API

Express + SQLite backend that stores each user's characters, favorites, custom
spells, custom wild shapes and card texts. Spell and beast reference data still
comes straight from dnd5eapi.co / open5e in the browser.

Requires Node 24+ (uses the built-in `node:sqlite` and runs TypeScript directly,
so there is no build step).

## Running

From the repo root:

```sh
npm install && npm --prefix server install
npm run dev          # API on :3001 and Vite on :5173 (Vite proxies /api)
```

Or just the API: `npm --prefix server run dev`.

| Env var    | Default                 |
|------------|-------------------------|
| `PORT`     | `3001`                  |
| `DB_PATH`  | `server/spellbook.db`   |
| `NODE_ENV` | set to `production` to mark the session cookie `Secure` |

The database file is created and migrated automatically on start. Migrations are
the numbered `.sql` files in `src/migrations/`; add a new file to change the schema.
Back up by copying `spellbook.db` (or `sqlite3 spellbook.db ".backup backup.db"`).

## Endpoints (all under `/api`)

- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `GET|POST /characters`, `PATCH|DELETE /characters/:id`
- `PUT|DELETE /characters/:id/favorite-spells/:spellIndex`
- `PUT|DELETE /characters/:id/favorite-wild-shapes/:key`
- `GET|POST /custom-spells`, `PUT|DELETE /custom-spells/:index`
- `GET|POST /custom-wild-shapes`, `PUT|DELETE /custom-wild-shapes/:key`
- `GET /card-texts`, `PUT|DELETE /card-texts/:spellIndex`
- `POST /import` — one-time import of the old localStorage data (idempotent)

Everything except `/auth/*` requires the session cookie, and every query is
scoped to the logged-in user. The one exception is sharing: `GET /custom-spells`
and `GET /custom-wild-shapes` also return items other users have shared
(`isShared: true, isOwn: false`). Those can be favorited but not edited or deleted.
Send `"isShared": true` in a POST/PUT body to share your own item.
