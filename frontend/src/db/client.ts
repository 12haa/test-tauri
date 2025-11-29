import { isTauri } from '../utils/env';
import { webStorage } from './webStorage';
import type Database from '@tauri-apps/plugin-sql';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import type { User } from './schema';

// For Tauri environment - raw SQLite instance
let sqlite: Awaited<ReturnType<typeof Database.load>> | null = null;
// Drizzle ORM instance
let db: ReturnType<typeof drizzle> | null = null;

// Initialize database based on environment
export const initDb = async () => {
  console.log('🗄️ Initializing database...');
  console.log('🌍 Environment - isTauri:', isTauri());

  if (isTauri()) {
    // Tauri environment - use SQLite with Drizzle
    console.log('📱 Using Tauri SQLite database with Drizzle ORM');
    const Database = await import('@tauri-apps/plugin-sql');
    sqlite = await Database.default.load('sqlite:app.db');
    console.log('✅ SQLite database loaded');

    // Create Drizzle instance with Tauri SQL plugin
    db = drizzle(
      async (sql, params, method) => {
        if (!sqlite) throw new Error('Database not initialized');

        try {
          if (method === 'run') {
            await sqlite.execute(sql, params);
            return { rows: [] };
          } else if (method === 'all') {
            const rows = (await sqlite.select(sql, params)) as Record<string, unknown>[];
            return { rows };
          } else {
            // 'get' method
            const rows = (await sqlite.select(sql, params)) as Record<string, unknown>[];
            return { rows: rows.slice(0, 1) };
          }
        } catch (error) {
          console.error('❌ Database query error:', error);
          throw error;
        }
      },
      { schema: { users } }
    );

    // Create users table if it doesn't exist
    await sqlite.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at INTEGER NOT NULL
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
    if (isTauri() && db) {
      // Use Drizzle ORM in Tauri
      if (whereClause?.username) {
        const result = await db
          .select()
          .from(users)
          .where(eq(users.username, whereClause.username));
        return result.map((row) => ({
          id: row.id,
          username: row.username,
          password: row.password,
          createdAt: row.createdAt,
        }));
      }
      const result = await db.select().from(users);
      return result.map((row) => ({
        id: row.id,
        username: row.username,
        password: row.password,
        createdAt: row.createdAt,
      }));
    } else {
      // Use localStorage in web
      return await webStorage.select('users', whereClause);
    }
  },

  async insertUser(values: { username: string; password: string }): Promise<User[]> {
    if (isTauri() && db) {
      // Use Drizzle ORM in Tauri
      await db.insert(users).values({
        username: values.username,
        password: values.password,
      });

      // Get the inserted user
      const result = await db.select().from(users).where(eq(users.username, values.username));
      return result.map((row) => ({
        id: row.id,
        username: row.username,
        password: row.password,
        createdAt: row.createdAt,
      }));
    } else {
      // Use localStorage in web
      // return await webStorage.insert('users', values);
      return [];
    }
  },
};
