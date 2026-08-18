/**
 * SQLite persistence for the context engine.
 *
 * The only rule that matters here: context_snapshots is append-only. There is no
 * UPDATE statement against it anywhere in this codebase. A student's history is
 * the full list of rows, and v1 -> v2 -> v3 is replayable because nothing was
 * ever overwritten.
 */

import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const rel = process.env.TOMO_DB_PATH || 'data/tomo.db';
  const file = path.isAbsolute(rel) ? rel : path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });

  db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  migrate(db);
  return db;
}

function migrate(d: Database.Database) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id               TEXT PRIMARY KEY,
      name             TEXT NOT NULL,
      grade            INTEGER NOT NULL,
      board            TEXT NOT NULL,
      section          TEXT NOT NULL,
      created_at       TEXT NOT NULL,
      last_activity_at TEXT
    );

    -- Append-only. Never updated, only inserted.
    CREATE TABLE IF NOT EXISTS context_snapshots (
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      version    INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      trigger    TEXT NOT NULL,
      payload    TEXT NOT NULL,
      PRIMARY KEY (student_id, version)
    );

    -- One Learn -> Practise -> Check block.
    CREATE TABLE IF NOT EXISTS sessions (
      id           TEXT PRIMARY KEY,
      student_id   TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      classroom_id TEXT NOT NULL,
      from_version INTEGER NOT NULL,
      to_version   INTEGER,
      started_at   TEXT NOT NULL,
      completed_at TEXT,
      plan         TEXT,
      evidence     TEXT
    );

    -- Every prompted operation, live or fallback, for the debug panel.
    CREATE TABLE IF NOT EXISTS llm_calls (
      id            TEXT PRIMARY KEY,
      created_at    TEXT NOT NULL,
      student_id    TEXT,
      operation     TEXT NOT NULL,
      model         TEXT NOT NULL,
      mode          TEXT NOT NULL,           -- live | fallback | cache
      latency_ms    INTEGER NOT NULL,
      input_tokens  INTEGER NOT NULL DEFAULT 0,
      output_tokens INTEGER NOT NULL DEFAULT 0,
      cost_usd      REAL NOT NULL DEFAULT 0,
      attempts      INTEGER NOT NULL DEFAULT 1,
      request       TEXT,
      response      TEXT,
      error         TEXT
    );

    -- Cache keyed on (student, concept, context version, operation) so the demo
    -- is fast and repeatable: replaying a screen never re-bills or re-rolls.
    CREATE TABLE IF NOT EXISTS generation_cache (
      cache_key  TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      payload    TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_snapshots_student ON context_snapshots(student_id, version DESC);
    CREATE INDEX IF NOT EXISTS idx_sessions_student  ON sessions(student_id, started_at DESC);
    CREATE INDEX IF NOT EXISTS idx_llm_created       ON llm_calls(created_at DESC);
  `);
}

/** Test/CLI helper. Drops everything and re-migrates. */
export function resetDb() {
  const d = getDb();
  d.exec(`
    DROP TABLE IF EXISTS context_snapshots;
    DROP TABLE IF EXISTS sessions;
    DROP TABLE IF EXISTS llm_calls;
    DROP TABLE IF EXISTS generation_cache;
    DROP TABLE IF EXISTS students;
  `);
  migrate(d);
}
