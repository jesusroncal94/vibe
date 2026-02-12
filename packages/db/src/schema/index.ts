import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ---- ACTIVE TABLES (Phase 0-1) ----

export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  model: text('model').default('claude-sonnet-4-5'),
  layout: text('layout', { enum: ['focus', 'minimal', 'productivity'] }).default('minimal'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  content: text('content').notNull(),
  model: text('model'),
  tokensIn: integer('tokens_in'),
  tokensOut: integer('tokens_out'),
  durationMs: integer('duration_ms'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const files = sqliteTable('files', {
  id: text('id').primaryKey(),
  messageId: text('message_id').references(() => messages.id, { onDelete: 'set null' }),
  conversationId: text('conversation_id').references(() => conversations.id, {
    onDelete: 'cascade',
  }),
  name: text('name').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  path: text('path').notNull(),
  type: text('type', {
    enum: ['image', 'pdf', 'docx', 'xlsx', 'csv', 'code', 'text', 'zip', 'other'],
  }).notNull(),
  metadata: text('metadata', { mode: 'json' }),
  direction: text('direction', { enum: ['upload', 'generated'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color').default('#6366f1'),
});

export const conversationTags = sqliteTable('conversation_tags', {
  conversationId: text('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  tagId: text('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }).notNull(),
});

// ---- PREPARED FOR FUTURE (not active in Phase 1) ----

export const enterprises = sqliteTable('enterprises', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  settings: text('settings', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  enterpriseId: text('enterprise_id').references(() => enterprises.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  path: text('path'),
  stack: text('stack', { mode: 'json' }),
  settings: text('settings', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
