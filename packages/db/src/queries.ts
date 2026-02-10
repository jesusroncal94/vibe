import { eq, desc, and } from 'drizzle-orm';
import { generateId } from '@vibe/shared';
import { getDb } from './client.js';
import { conversations, messages, tags, conversationTags, settings } from './schema/index.js';

export function createConversation(data: { title: string; model?: string }) {
  const db = getDb();
  const now = new Date();
  const id = generateId();
  db.insert(conversations)
    .values({
      id,
      title: data.title,
      model: data.model ?? 'claude-sonnet-4-5',
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return { id, title: data.title, model: data.model ?? 'claude-sonnet-4-5', createdAt: now, updatedAt: now };
}

export function getConversations() {
  const db = getDb();
  return db.select().from(conversations).orderBy(desc(conversations.updatedAt)).all();
}

export function getConversation(id: string) {
  const db = getDb();
  return db.select().from(conversations).where(eq(conversations.id, id)).get();
}

export function deleteConversation(id: string) {
  const db = getDb();
  db.delete(conversations).where(eq(conversations.id, id)).run();
}

export function createMessage(data: {
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  tokensIn?: number;
  tokensOut?: number;
  durationMs?: number;
}) {
  const db = getDb();
  const id = generateId();
  const now = new Date();
  db.insert(messages)
    .values({
      id,
      conversationId: data.conversationId,
      role: data.role,
      content: data.content,
      model: data.model ?? null,
      tokensIn: data.tokensIn ?? null,
      tokensOut: data.tokensOut ?? null,
      durationMs: data.durationMs ?? null,
      createdAt: now,
    })
    .run();

  // Update conversation timestamp
  db.update(conversations)
    .set({ updatedAt: now })
    .where(eq(conversations.id, data.conversationId))
    .run();

  return { id, ...data, createdAt: now };
}

export function getMessages(conversationId: string) {
  const db = getDb();
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt)
    .all();
}

export function createTag(data: { name: string; color?: string }) {
  const db = getDb();
  const id = generateId();
  db.insert(tags)
    .values({ id, name: data.name, color: data.color ?? '#6366f1' })
    .run();
  return { id, ...data };
}

export function getTags() {
  const db = getDb();
  return db.select().from(tags).all();
}

export function assignTag(conversationId: string, tagId: string) {
  const db = getDb();
  db.insert(conversationTags).values({ conversationId, tagId }).run();
}

export function removeTag(conversationId: string, tagId: string) {
  const db = getDb();
  db.delete(conversationTags)
    .where(
      and(
        eq(conversationTags.conversationId, conversationId),
        eq(conversationTags.tagId, tagId),
      ),
    )
    .run();
}

export function getSetting(key: string) {
  const db = getDb();
  return db.select().from(settings).where(eq(settings.key, key)).get();
}

export function setSetting(key: string, value: unknown) {
  const db = getDb();
  db.insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } })
    .run();
}
