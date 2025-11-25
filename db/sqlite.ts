import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("pocketledger.db");

export function initDb() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      categoryId TEXT NOT NULL,
      note TEXT,
      date TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      syncStatus TEXT NOT NULL
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      createdAt TEXT NOT NULL
    );
  `);
}
