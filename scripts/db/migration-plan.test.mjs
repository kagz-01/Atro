import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { isMigrationFile, migrationName, pendingMigrations } from "./migration-plan.mjs";
import { projectRoot } from "../with-app-env.mjs";

test("_migrations keys on basename, not path", () => {
  assert.equal(migrationName("/migrations/0002_todos.sql"), "0002_todos.sql");
  assert.equal(migrationName("0001_auth.sql"), "0001_auth.sql");
});

test("the schema bootstrap runs first on an empty database", () => {
  assert.deepEqual(
    pendingMigrations(["/migrations/0033_c.sql", "/migrations/schema.sql"], []),
    [
      { name: "schema.sql", path: "/migrations/schema.sql" },
      { name: "0033_c.sql", path: "/migrations/0033_c.sql" },
    ],
  );
});

test("legacy databases skip the consolidated schema and apply later migrations", () => {
  assert.deepEqual(
    pendingMigrations(
      ["/migrations/schema.sql", "/migrations/0033_c.sql"],
      ["0001_enquiries.sql", "0032_paystack_and_project_expenses.sql"],
    ),
    [{ name: "0033_c.sql", path: "/migrations/0033_c.sql" }],
  );
});

test("non-.sql entries are dropped", () => {
  assert.equal(isMigrationFile("auth"), false);
  assert.deepEqual(pendingMigrations(["auth", "README.md"], []), []);
});

test("the migrations directory uses one canonical SQL bootstrap", () => {
  const migrationsDir = join(projectRoot(), "migrations");
  assert.deepEqual(readdirSync(migrationsDir).filter((entry) => entry.endsWith(".sql")), [
    "schema.sql",
  ]);
});
