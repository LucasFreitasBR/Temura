import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const leads = sqliteTable('leads', {
 id: text('id').primaryKey(), name: text('name').notNull(), email: text('email').notNull(), company: text('company').notNull().default(''), service: text('service').notNull(), message: text('message').notNull(), consentVersion: text('consent_version').notNull(), createdAt: integer('created_at').notNull()
}, t => [index('idx_leads_created_at').on(t.createdAt)]);
export const rateLimits = sqliteTable('rate_limits', { key: text('key').primaryKey(), count: integer('count').notNull(), expiresAt: integer('expires_at').notNull() },t => [index('idx_rate_limits_expires_at').on(t.expiresAt)]);
