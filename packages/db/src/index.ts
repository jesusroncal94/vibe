export * from './schema/index.js';
export { getDb, type VibeDb } from './client.js';
export {
  createConversation,
  getConversations,
  getConversation,
  deleteConversation,
  createMessage,
  getMessages,
  createTag,
  getTags,
  assignTag,
  removeTag,
  getSetting,
  setSetting,
} from './queries.js';
