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
  deleteTag,
  getTagsForConversation,
  assignTag,
  removeTag,
  getAllSettings,
  getSetting,
  setSetting,
} from './queries';
