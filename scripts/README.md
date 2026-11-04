# Project scripts

- `db/` contains the SQL migration runner, migration bookkeeping, and local
  seed data.
- `vite/` contains Vite plugins and shared PWA build assets.
- `checks/` contains browser-smoke verdict logic and auth configuration checks.
- Root-level scripts are shared entry points and runtime helpers, including the
  app-environment wrapper, preview controls, PGlite asset copier, and stable
  command-line checks used by local workflows.

Run database migrations from the repository root with `npm run db:migrate`.
`migrations/schema.sql` is the canonical baseline for fresh databases; future
schema changes continue with `0033_*.sql` and later numbered migrations. Tests
under these folders are included by `npm test`.
