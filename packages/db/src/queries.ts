import { eq, desc, and, like, or, inArray, count, sum } from 'drizzle-orm';
import { generateId } from '@vibe/shared';
import { getDb } from './client';
import { conversations, messages, tags, conversationTags, settings, files } from './schema/index';

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

export function renameConversation(id: string, title: string) {
  const db = getDb();
  const now = new Date();
  db.update(conversations)
    .set({ title, updatedAt: now })
    .where(eq(conversations.id, id))
    .run();
}

export function updateConversationModel(id: string, model: string) {
  const db = getDb();
  const now = new Date();
  db.update(conversations)
    .set({ model, updatedAt: now })
    .where(eq(conversations.id, id))
    .run();
}

export function getConversationsWithPreview() {
  const db = getDb();
  const convos = db
    .select()
    .from(conversations)
    .orderBy(desc(conversations.updatedAt))
    .all();

  return convos.map((conv) => {
    const lastMessage = db
      .select({ content: messages.content, createdAt: messages.createdAt, role: messages.role })
      .from(messages)
      .where(eq(messages.conversationId, conv.id))
      .orderBy(desc(messages.createdAt))
      .limit(1)
      .get();

    const tagRows = db
      .select({ tagId: conversationTags.tagId })
      .from(conversationTags)
      .where(eq(conversationTags.conversationId, conv.id))
      .all();

    const convTags = tagRows.length > 0
      ? db.select().from(tags).where(or(...tagRows.map((r) => eq(tags.id, r.tagId)))).all()
      : [];

    return {
      ...conv,
      lastMessage: lastMessage
        ? { content: lastMessage.content, createdAt: lastMessage.createdAt, role: lastMessage.role }
        : null,
      tags: convTags,
    };
  });
}

export function searchConversations(query: string) {
  const db = getDb();
  const pattern = `%${query}%`;

  const byTitle = db
    .select({ id: conversations.id })
    .from(conversations)
    .where(like(conversations.title, pattern))
    .all()
    .map((r) => r.id);

  const byContent = db
    .select({ id: messages.conversationId })
    .from(messages)
    .where(like(messages.content, pattern))
    .all()
    .map((r) => r.id);

  const uniqueIds = [...new Set([...byTitle, ...byContent])];
  if (uniqueIds.length === 0) return [];

  return db
    .select()
    .from(conversations)
    .where(or(...uniqueIds.map((id) => eq(conversations.id, id))))
    .orderBy(desc(conversations.updatedAt))
    .all();
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

export function deleteTag(id: string) {
  const db = getDb();
  db.delete(tags).where(eq(tags.id, id)).run();
}

export function getTagsForConversation(conversationId: string) {
  const db = getDb();
  const rows = db
    .select({ tagId: conversationTags.tagId })
    .from(conversationTags)
    .where(eq(conversationTags.conversationId, conversationId))
    .all();

  if (rows.length === 0) return [];

  return db
    .select()
    .from(tags)
    .where(or(...rows.map((r) => eq(tags.id, r.tagId))))
    .all();
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

export function getAllSettings() {
  const db = getDb();
  return db.select().from(settings).all();
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

// ---- FILE QUERIES ----

export function createFile(data: {
  messageId?: string | null;
  conversationId?: string | null;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  type: 'image' | 'pdf' | 'docx' | 'xlsx' | 'csv' | 'code' | 'text' | 'zip' | 'other';
  metadata?: Record<string, unknown> | null;
  direction: 'upload' | 'generated';
}) {
  const db = getDb();
  const id = generateId();
  const now = new Date();
  db.insert(files)
    .values({
      id,
      messageId: data.messageId ?? null,
      conversationId: data.conversationId ?? null,
      name: data.name,
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
      path: data.path,
      type: data.type,
      metadata: data.metadata ?? null,
      direction: data.direction,
      createdAt: now,
    })
    .run();
  return { id, ...data, createdAt: now };
}

export function getFile(id: string) {
  const db = getDb();
  return db.select().from(files).where(eq(files.id, id)).get();
}

export function getFilesByMessage(messageId: string) {
  const db = getDb();
  return db.select().from(files).where(eq(files.messageId, messageId)).all();
}

export function getFilesByConversation(conversationId: string) {
  const db = getDb();
  return db.select().from(files).where(eq(files.conversationId, conversationId)).all();
}

export function attachFilesToMessage(fileIds: string[], messageId: string) {
  if (fileIds.length === 0) return;
  const db = getDb();
  db.update(files)
    .set({ messageId })
    .where(inArray(files.id, fileIds))
    .run();
}

export function deleteFile(id: string) {
  const db = getDb();
  db.delete(files).where(eq(files.id, id)).run();
}

export function updateFileMetadata(id: string, metadata: Record<string, unknown>) {
  const db = getDb();
  db.update(files).set({ metadata }).where(eq(files.id, id)).run();
}

export function getFilesWithPagination(opts: {
  search?: string;
  type?: string;
  direction?: string;
  conversationId?: string;
  offset: number;
  limit: number;
}): { files: (typeof files.$inferSelect)[]; total: number } {
  const db = getDb();
  const conditions = [];

  if (opts.search) {
    conditions.push(like(files.originalName, `%${opts.search}%`));
  }
  if (opts.type) {
    conditions.push(eq(files.type, opts.type as 'image' | 'pdf' | 'docx' | 'xlsx' | 'csv' | 'code' | 'text' | 'zip' | 'other'));
  }
  if (opts.direction) {
    conditions.push(eq(files.direction, opts.direction as 'upload' | 'generated'));
  }
  if (opts.conversationId) {
    conditions.push(eq(files.conversationId, opts.conversationId));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const totalResult = db
    .select({ count: count() })
    .from(files)
    .where(where)
    .get();
  const total = totalResult?.count ?? 0;

  const rows = db
    .select()
    .from(files)
    .where(where)
    .orderBy(desc(files.createdAt))
    .offset(opts.offset)
    .limit(opts.limit)
    .all();

  return { files: rows, total };
}

export function deleteFiles(ids: string[]) {
  if (ids.length === 0) return;
  const db = getDb();
  db.delete(files).where(inArray(files.id, ids)).run();
}

export function getFileStats(): {
  totalFiles: number;
  totalSize: number;
  byType: Record<string, { count: number; size: number }>;
} {
  const db = getDb();

  const totals = db
    .select({
      totalFiles: count(),
      totalSize: sum(files.size),
    })
    .from(files)
    .get();

  const byTypeRows = db
    .select({
      type: files.type,
      fileCount: count(),
      totalSize: sum(files.size),
    })
    .from(files)
    .groupBy(files.type)
    .all();

  const byType: Record<string, { count: number; size: number }> = {};
  for (const row of byTypeRows) {
    byType[row.type] = {
      count: row.fileCount,
      size: Number(row.totalSize ?? 0),
    };
  }

  return {
    totalFiles: totals?.totalFiles ?? 0,
    totalSize: Number(totals?.totalSize ?? 0),
    byType,
  };
}
