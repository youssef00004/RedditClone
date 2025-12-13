import api from "./api";

const chatService = {
  getConversations: async () => {
    const response = await api.get("/chat/conversations");
    return response.data;
  },

  getOrCreateConversation: async (participantId) => {
    const response = await api.post("/chat/conversation", { participantId });
    return response.data;
  },

  getMessages: async (conversationId, page = 1) => {
    const response = await api.get(
      `/chat/messages/${conversationId}?page=${page}`
    );
    return response.data;
  },

  sendMessage: async (conversationId, content) => {
    const response = await api.post("/chat/message", {
      conversationId,
      content,
    });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get("/chat/unread");
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await api.get(`/chat/search-users?query=${query}`);
    return response.data;
  },
};

export default chatService;
