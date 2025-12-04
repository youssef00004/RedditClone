import api from "./api";

const userService = {
  // Get user profile by ID
  getUserProfile: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch user profile";
    }
  },

  // Get user by username
  getUserByUsername: async (username) => {
    try {
      const response = await api.get(`/users/username/${username}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch user";
    }
  },

  // Get user's posts
  getUserPosts: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/posts`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch user posts";
    }
  },

  // Get user's comments
  getUserComments: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/comments`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch user comments";
    }
  },

  // Get user's upvoted posts
  getUserUpvotedPosts: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/upvoted/posts`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch upvoted posts";
    }
  },

  // Get user's downvoted posts
  getUserDownvotedPosts: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/downvoted/posts`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch downvoted posts";
    }
  },

  // Get user's upvoted comments
  getUserUpvotedComments: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/upvoted/comments`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch upvoted comments";
    }
  },

  // Get user's downvoted comments
  getUserDownvotedComments: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/downvoted/comments`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data?.message || "Failed to fetch downvoted comments"
      );
    }
  },

  // Get user's saved posts
  getUserSavedPosts: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/saved`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch saved posts";
    }
  },

  // Save a post
  savePost: async (postId) => {
    try {
      const response = await api.post("/users/save", { postId });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to save post";
    }
  },

  // Unsave a post
  unsavePost: async (postId) => {
    try {
      const response = await api.post("/users/unsave", { postId });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to unsave post";
    }
  },

  // Follow a user
  followUser: async (userId) => {
    try {
      const response = await api.post(`/users/${userId}/follow`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to follow user";
    }
  },

  // Unfollow a user
  unfollowUser: async (userId) => {
    try {
      const response = await api.post(`/users/${userId}/unfollow`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to unfollow user";
    }
  },

  // Update user profile
  updateUserProfile: async (userId, updateData) => {
    try {
      const response = await api.put(`/users/${userId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to update profile";
    }
  },
};

export default userService;
