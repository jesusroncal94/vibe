export * from './schema/index';
export { getDb, type VibeDb } from './client';
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
} from './queries';
