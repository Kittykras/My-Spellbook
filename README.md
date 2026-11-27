# My Spellbook

A personal D&D 5e (2024) spellbook. Browse and search spells, keep a spellbook per
character, print spell cards, and — for Druids — browse and save Wild Shapes. You
can also create your own custom spells and wild shapes.

Each user has an account; characters, favorites, custom content and card texts are
stored in a SQLite database on the server, so they follow you across browsers and
devices.

## Tech stack

- **Frontend:** React 19 + TypeScript + Vite, Sass
- **Backend:** Node + Express 5 + TypeScript (`server/`)
- **Database:** SQLite via Node's built-in `node:sqlite`
- **Reference data:** spells from [dnd5eapi.co](https://www.dnd5eapi.co), beasts from
  [open5e](https://open5e.com) — fetched directly by the browser, not stored by us

## Getting started

Requires **Node 24 or newer**.

```sh
npm install
npm --prefix server install
npm run dev
```

Then open http://localhost:5173 and create an account.

`npm run dev` starts both the API (port 3001) and the Vite dev server (port 5173).
Vite forwards every `/api` request to the API, so the browser only talks to one origin.

## Scripts

| Command                    | What it does                                     |
|----------------------------|--------------------------------------------------|
| `npm run dev`              | Start API and frontend together                  |
| `npm run dev:web`          | Start only the frontend (Vite)                   |
| `npm run dev:server`       | Start only the API (restarts on file changes)    |
| `npm run build`            | Typecheck and build the frontend into `dist/`    |
| `npm run typecheck:server` | Typecheck the server                             |
| `npm run lint`             | Run ESLint on frontend and server                |
| `npm run preview`          | Preview the production frontend build            |

## Database

The database is the file **`server/spellbook.db`**. It is created automatically,
with all tables, the first time the server starts, and it is git-ignored. While the
server runs you may also see `spellbook.db-wal` and `spellbook.db-shm` next to it;
those belong to SQLite.

- Use a different location: start the server with `DB_PATH=/path/to/spellbook.db`.
- Inspect it: `sqlite3 server/spellbook.db ".tables"`, or open the file in
  DB Browser for SQLite / TablePlus.
- Back it up: `sqlite3 server/spellbook.db ".backup backup.db"`.
- Change the schema: add a new numbered file in `server/src/migrations/`
  (e.g. `002_add_notes.sql`). It runs once, automatically, on the next start.

What is stored per user: characters (name, classes), each character's favorite
spells and wild shapes, custom spells, custom wild shapes, and custom card texts.

## Moving data from the old version

Earlier versions saved everything in the browser's `localStorage`. After logging in
in a browser that still has that data, a banner offers to **import** it into your
account. Importing is safe to repeat, and the old browser data is removed once it
succeeds.

## Project structure

```
src/
  App.tsx              main app: state, filtering, and saving changes to the API
  api/backend.ts       calls to our own API (auth, characters, custom content, import)
  api/request.ts       calls to the external D&D reference APIs
  components/          UI components (AuthGate/AuthForm handle login)
  types/               shared TypeScript types (also used by the server)
server/
  src/index.ts         Express app and route setup
  src/auth.ts          register / login / logout and session handling
  src/db.ts            opens the database and runs migrations
  src/routes/          one file per resource
  src/migrations/      SQL schema files
```

See [`server/README.md`](server/README.md) for the API endpoints and server
configuration.

## Deploying

Before putting this online:

- Run the server with `NODE_ENV=production` so the session cookie is marked `Secure`
  (requires HTTPS).
- Serve the built frontend (`dist/`) from the same domain as the API so the login
  cookie works.
- Add rate limiting to the login and register endpoints.
- Keep `spellbook.db` on persistent storage and back it up regularly.
