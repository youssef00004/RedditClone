import api from "./api";

const postService = {
  // Create text post
  createTextPost: async (title, content, communityId) => {
    try {
      const response = await api.post("/posts", {
        title,
        content,
        communityId,
        type: "text",
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to create post";
    }
  },

  // Create image post
  createImagePost: async (title, image, communityId) => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("communityId", communityId);
      formData.append("type", "image");
      formData.append("image", image);

      const response = await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to create post";
    }
  },

  // Create link post
  createLinkPost: async (title, link, communityId) => {
    try {
      const response = await api.post("/posts", {
        title,
        link,
        communityId,
        type: "link",
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to create post";
    }
  },

  // Get feed posts (joined communities only)
  getFeedPosts: async () => {
    try {
      const response = await api.get("/posts/feed");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch posts";
    }
  },

  // Get all posts from all communities
  getAllPosts: async () => {
    try {
      const response = await api.get("/posts/all");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch all posts";
    }
  },

  // Get posts from followed users and joined communities
  getFollowingFeed: async () => {
    try {
      const response = await api.get("/posts/following");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch following feed";
    }
  },

  // Get community posts
  getCommunityPosts: async (communityId) => {
    try {
      const response = await api.get(`/posts/community/${communityId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch community posts";
    }
  },

  // Get post by ID
  getPostById: async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch post";
    }
  },

  // Vote on post
  votePost: async (postId, type) => {
    try {
      const response = await api.post(`/posts/${postId}/vote`, { type });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to vote";
    }
  },

  // Delete post
  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to delete post";
    }
  },
};

export default postService;
