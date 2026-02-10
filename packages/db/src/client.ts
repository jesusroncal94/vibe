import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema/index.js';

let db: ReturnType<typeof createDb> | null = null;

function createDb(url?: string) {
  const sqlite = new Database(url ?? process.env.DATABASE_URL ?? './data/vibe.db');
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  return drizzle(sqlite, { schema });
}

export function getDb(url?: string) {
  if (!db) {
    db = createDb(url);
  }
  return db;
}

export type VibeDb = ReturnType<typeof getDb>;
