import api from "./api";

const commentService = {
  // Get comments for a post
  getCommentsByPost: async (postId) => {
    try {
      const response = await api.get(`/comments/${postId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch comments";
    }
  },

  // Create a comment
  createComment: async (postId, content, parentCommentId = null) => {
    try {
      const response = await api.post(`/comments/${postId}`, {
        content,
        parentCommentId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to create comment";
    }
  },

  // Vote on a comment
  voteComment: async (commentId, type) => {
    try {
      const response = await api.post(`/comments/${commentId}/vote`, { type });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to vote on comment";
    }
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    try {
      const response = await api.delete(`/comments/${commentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to delete comment";
    }
  },
};

export default commentService;
