import { isTauri } from '../utils/env';
import { webStorage } from './webStorage';
import type Database from '@tauri-apps/plugin-sql';

// User type definition
export interface User {
  id: number;
  username: string;
  password: string;
  created_at: number;
}

// For Tauri environment
let sqlite: Awaited<ReturnType<typeof Database.load>> | null = null;

// Initialize database based on environment
export const initDb = async () => {
  console.log('🗄️ Initializing database...');
  console.log('🌍 Environment - isTauri:', isTauri());

  if (isTauri()) {
    // Tauri environment - use SQLite
    console.log('📱 Using Tauri SQLite database');
    const Database = await import('@tauri-apps/plugin-sql');
    sqlite = await Database.default.load('sqlite:app.db');
    console.log('✅ SQLite database loaded');

    await sqlite.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at INTEGER DEFAULT (cast(strftime('%s','now') as int))
      );
    `);
    console.log('✅ Users table created/verified');
  } else {
    // Web environment - use localStorage
    console.log('🌐 Using Web localStorage');
    await webStorage.init();
    console.log('✅ Web storage initialized');
  }
};

// Unified database API
export const dbApi = {
  async selectUsers(whereClause?: { username: string }): Promise<User[]> {
    if (isTauri() && sqlite) {
      // Use SQLite in Tauri
      if (whereClause?.username) {
        return await sqlite.select('SELECT * FROM users WHERE username = ?', [
          whereClause.username,
        ]);
      }
      return await sqlite.select('SELECT * FROM users', []);
    } else {
      // Use localStorage in web
      return await webStorage.select('users', whereClause);
    }
  },

  async insertUser(values: { username: string; password: string }): Promise<User[]> {
    if (isTauri() && sqlite) {
      // Use SQLite in Tauri
      await sqlite.execute('INSERT INTO users (username, password) VALUES (?, ?)', [
        values.username,
        values.password,
      ]);
      // Get the inserted user
      return await sqlite.select('SELECT * FROM users WHERE username = ?', [values.username]);
    } else {
      // Use localStorage in web
      return await webStorage.insert('users', values);
    }
  },
};
