"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimits = exports.leads = void 0;
var sqlite_core_1 = require("drizzle-orm/sqlite-core");
exports.leads = (0, sqlite_core_1.sqliteTable)('leads', {
    id: (0, sqlite_core_1.text)('id').primaryKey(), name: (0, sqlite_core_1.text)('name').notNull(), email: (0, sqlite_core_1.text)('email').notNull(), company: (0, sqlite_core_1.text)('company').notNull().default(''), service: (0, sqlite_core_1.text)('service').notNull(), message: (0, sqlite_core_1.text)('message').notNull(), consentVersion: (0, sqlite_core_1.text)('consent_version').notNull(), createdAt: (0, sqlite_core_1.integer)('created_at').notNull()
}, function (t) { return [(0, sqlite_core_1.index)('idx_leads_created_at').on(t.createdAt)]; });
exports.rateLimits = (0, sqlite_core_1.sqliteTable)('rate_limits', { key: (0, sqlite_core_1.text)('key').primaryKey(), count: (0, sqlite_core_1.integer)('count').notNull(), expiresAt: (0, sqlite_core_1.integer)('expires_at').notNull() }, function (t) { return [(0, sqlite_core_1.index)('idx_rate_limits_expires_at').on(t.expiresAt)]; });
