import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema/index';

let db: ReturnType<typeof createDb> | null = null;

function ensureTables(sqlite: Database.Database) {
  const row = sqlite
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='conversations'")
    .get() as { name: string } | undefined;

  if (row) return;

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      model TEXT DEFAULT 'claude-sonnet-4-5',
      layout TEXT DEFAULT 'minimal',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      model TEXT,
      tokens_in INTEGER,
      tokens_out INTEGER,
      duration_ms INTEGER,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      message_id TEXT REFERENCES messages(id) ON DELETE SET NULL,
      conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      path TEXT NOT NULL,
      type TEXT NOT NULL,
      metadata TEXT,
      direction TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT DEFAULT '#6366f1'
    );

    CREATE TABLE IF NOT EXISTS conversation_tags (
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (conversation_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS enterprises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      settings TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      enterprise_id TEXT REFERENCES enterprises(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      path TEXT,
      stack TEXT,
      settings TEXT,
      created_at INTEGER NOT NULL
    );
  `);
}

function createDb(url?: string) {
  const dbPath = url ?? process.env.DATABASE_URL ?? './data/vibe.db';
  mkdirSync(dirname(dbPath), { recursive: true });
  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  ensureTables(sqlite);
  return drizzle(sqlite, { schema });
}

export function getDb(url?: string) {
  if (!db) {
    db = createDb(url);
  }
  return db;
}

export type VibeDb = ReturnType<typeof getDb>;
