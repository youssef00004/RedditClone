import api from "./api";

const aiService = {
  // Summarize a post
  summarizePost: async (postId) => {
    try {
      const response = await api.get(`/ai/summarize/${postId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to summarize post";
    }
  },
};

export default aiService;
