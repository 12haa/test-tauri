import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  createdAt: integer('created_at')
    .notNull()
    .$defaultFn(() => Math.floor(Date.now() / 1000)), // Unix timestamp in seconds
});

// Export types for use in the application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
