# Backup — Database & Original Backend Handler

Snapshot taken: **2026-04-24**
Source commit: current `main` of `eslamelkilany/bolt`

This folder is a read-only reference of the database schema and the original
Cloudflare Pages Function as it existed before we start refactoring. Nothing
here is imported by the live app — the running handler is still
`functions/api/[[path]].js`.

## Contents

| File | Purpose |
|---|---|
| `schema.sql` | Clean DDL for the 3 D1 tables (`users`, `sessions`, `activity_log`) with recommended indexes. Safe to run against any SQLite / D1 instance. |
| `seed.sql` | Default admin seed (`eslamelkilany@gmail.com`). **Password is plaintext** — replace before use. |
| `original-handler.js` | Verbatim copy of `functions/api/[[path]].js` at the time of backup. Keep for diff/audit during refactor. |

## Database Overview

Three tables, SQLite on Cloudflare D1:

### `users`
Candidates, managers, and admins. Role-gated. Three JSON-serialised columns
hold per-user state that really belongs in separate tables (see "Known
issues" below).

### `sessions`
One row per login. Session `id` is used as the auth token on the client.
24-hour TTL; expired rows are never swept.

### `activity_log`
Append-only audit table. Actions emitted: `LOGIN`, `CREATE_USER`,
`COMPLETE_ASSESSMENT`. No reader UI is wired up yet.

## How the live handler builds the DB

`functions/api/[[path]].js` calls `initializeDatabase(db)` on **every**
request. The function uses `CREATE TABLE IF NOT EXISTS` + an `INSERT` of the
default admin gated by a `SELECT`. There is also a manual `GET /api/init`
route that does the same thing.

That means today there are **no migrations** — schema changes would have to
be hand-applied to the live D1 instance. Moving to real migrations is on the
refactor list.

## Known issues carried over from the original

1. **Plaintext passwords.** `users.password` is stored as-is and compared
   with a plain `WHERE email = ? AND password = ?`. Must move to a hash
   (PBKDF2/bcrypt-edge/argon2) before anything else.
2. **Committed admin credentials.** The default admin email + password are
   hard-coded in `original-handler.js` (and in the live handler). Rotate
   the live password, then remove the constant and inject via Cloudflare
   secrets + a migration-driven seed.
3. **JSON-in-TEXT columns.** `assignedAssessments`, `completedAssessments`,
   and `reports` are stored as JSON strings. This blocks any SQL-level
   filtering, makes reports unqueryable, and means "get all reports" scans
   every user row. These should become proper relational tables:
   `assessment_assignments`, `assessment_completions`, `reports`.
4. **No auth middleware.** `GET/PUT/DELETE /api/users/:id`,
   `POST /api/tokens/reset/:userId` and `GET /api/reports` have no session
   check. Anyone who can reach the API can read and mutate anything.
5. **Schema DDL lives inside the request handler.** Needs to move into a
   `migrations/` folder applied via `wrangler d1 migrations apply`.
6. **No indexes in the original.** This backup's `schema.sql` adds the
   recommended ones; they are not yet in production.
7. **Sessions never expire server-side.** Expired rows stay forever; no
   cron/cleanup job.

## Restoring the DB on a fresh D1 instance

```bash
# Create the D1 database (once)
wrangler d1 create kafaat-db

# Apply schema and seed
wrangler d1 execute kafaat-db --file=backup/schema.sql
wrangler d1 execute kafaat-db --file=backup/seed.sql

# Bind it in wrangler.toml (not yet committed) as `DB`
# [[d1_databases]]
# binding = "DB"
# database_name = "kafaat-db"
# database_id = "<from wrangler d1 create output>"
```

## Do not edit these files

Any refactor goes in `functions/` (or the new `migrations/` folder once we
create it). This folder is frozen so we always have a reference point for
"what did production look like before we touched it."
