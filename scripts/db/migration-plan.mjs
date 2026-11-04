// @ts-check
/**
 * Migration bookkeeping shared by the two appliers — `scripts/db/migrate.mjs`
 * (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
 *
 * The consolidated schema bootstraps empty databases. Databases created by the
 * former numbered migrations already have those names in `_migrations`, so the
 * snapshot is skipped for them. New incremental migrations remain numbered.
 */

/**
 * The `_migrations` key for a migration path (or bare filename).
 * @param {string} path
 * @returns {string}
 */
export function migrationName(path) {
  return path.split("/").pop() ?? path;
}

/**
 * @param {string} path
 * @returns {boolean}
 */
export function isMigrationFile(path) {
  return path.endsWith(".sql");
}

/**
 * Pending work with the schema baseline first on an empty database. A database
 * with numbered migration records predates the snapshot and must not replay it.
 * @param {Iterable<string>} paths
 * @param {Iterable<string>} applied
 * @returns {Array<{ name: string, path: string }>}
 */
export function pendingMigrations(paths, applied) {
  const done = new Set(applied);
  const candidates = [...paths]
    .filter(isMigrationFile)
    .map((path) => ({ name: migrationName(path), path }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter(({ name }) => !done.has(name));
  const schema = candidates.find(({ name }) => name === "schema.sql");
  const hasLegacyMigrationHistory = [...done].some((name) =>
    /^\d{4}_.+\.sql$/.test(name),
  );
  const pending = candidates.filter(({ name }) => name !== "schema.sql");

  if (schema && !hasLegacyMigrationHistory) {
    return [schema, ...pending];
  }
  return pending;
}
