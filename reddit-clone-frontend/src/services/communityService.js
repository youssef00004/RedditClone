import api from "./api";

const communityService = {
  // Get all communities
  getAllCommunities: async () => {
    try {
      const response = await api.get("/communities");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch communities";
    }
  },

  // Get community by ID
  getCommunityById: async (communityId) => {
    try {
      const response = await api.get(`/communities/${communityId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch community";
    }
  },

  // Create community
  createCommunity: async (name, description) => {
    try {
      const response = await api.post("/communities", { name, description });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to create community";
    }
  },

  // Join community
  joinCommunity: async (communityId) => {
    try {
      const response = await api.post(`/communities/${communityId}/join`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to join community";
    }
  },

  // Leave community
  leaveCommunity: async (communityId) => {
    try {
      const response = await api.post(`/communities/${communityId}/leave`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to leave community";
    }
  },
};

export default communityService;
