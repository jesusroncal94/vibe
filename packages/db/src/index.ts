export * from './schema/index.js';
export { getDb, type VibeDb } from './client.js';
export {
  createConversation,
  getConversations,
  getConversation,
  deleteConversation,
  renameConversation,
  updateConversationModel,
  getConversationsWithPreview,
  searchConversations,
  createMessage,
  getMessages,
  createTag,
  getTags,
  assignTag,
  removeTag,
  getSetting,
  setSetting,
} from './queries.js';
