import api from "./api";

const notificationService = {
  // Get user's notifications
  getNotifications: async () => {
    try {
      const response = await api.get("/notifications");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch notifications";
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await api.get("/notifications/unread/count");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch unread count";
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to mark as read";
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      const response = await api.put("/notifications/read/all");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to mark all as read";
    }
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to delete notification";
    }
  },

  // Delete all notifications
  deleteAllNotifications: async () => {
    try {
      const response = await api.delete("/notifications/all/clear");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data?.message || "Failed to delete all notifications"
      );
    }
  },
};

export default notificationService;
