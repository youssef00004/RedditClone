import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  MessageCircle,
  ThumbsUp,
  Loader2,
  X,
  CheckCheck,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import notificationService from "../services/notificationService";
import CreateCommunityFlow from "./CreateCommunityFlow";
import { showError } from "../utils/toast";

const Notification = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(
        notifications.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
      showError(err || "Failed to mark all as read");
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(notifications.filter((n) => n._id !== notificationId));
    } catch (err) {
      console.error("Error deleting notification:", err);
      showError(err || "Failed to delete notification");
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }

    // Navigate based on notification type
    if (notification.type === "follow") {
      navigate(`/user/${notification.sender.username}`);
    } else if (notification.post) {
      navigate(`/post/${notification.post._id}`);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "follow":
        return <UserPlus size={16} className="text-blue-500" />;
      case "comment":
        return <MessageCircle size={16} className="text-green-500" />;
      case "upvote":
        return <ThumbsUp size={16} className="text-orange-500" />;
      default:
        return <UserPlus size={16} className="text-gray-500" />;
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";

    return Math.floor(seconds) + "s ago";
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-[#D7DADC] font-sans flex flex-col">
      <Navbar />

      <div className="pt-14 flex">
        <Sidebar setIsPopupOpen={setIsPopupOpen} />

        {/* Main Content */}
        <main className="flex-1 flex justify-center py-8 px-4">
          <div className="w-full max-w-4xl">
            {/* Header Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h1>

                {notifications.length > 0 && unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <CheckCheck size={18} />
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
                <p className="font-medium">Error loading notifications</p>
                <p className="text-sm mt-1">{error}</p>
                <button
                  onClick={fetchNotifications}
                  className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-black rounded-lg">
                <div className="w-16 h-16 bg-gray-200 dark:bg-[#0B1416] rounded-full flex items-center justify-center mb-4">
                  <UserPlus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No notifications yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                  When someone follows you or interacts with your posts, you'll
                  see it here.
                </p>
              </div>
            )}

            {/* Notifications List */}
            {!loading && !error && notifications.length > 0 && (
              <div className="flex flex-col gap-0 bg-white dark:bg-black rounded-lg overflow-hidden">
                {notifications.map((notification, index) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex gap-3 p-4 cursor-pointer transition-colors relative group ${
                      !notification.read
                        ? "bg-blue-50 dark:bg-[#1A282D] border-l-4 border-blue-500"
                        : "bg-white dark:bg-[#131F23] hover:bg-gray-50 dark:hover:bg-[#1A2831]"
                    } ${
                      index !== notifications.length - 1
                        ? "border-b border-gray-200 dark:border-[#0B1416]"
                        : ""
                    }`}
                  >
                    {/* Avatar/Icon */}
                    <div className="flex-shrink-0 pt-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {notification.sender?.username
                            ?.charAt(0)
                            .toUpperCase() || "U"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          {getNotificationIcon(notification.type)}
                          <span className="font-semibold text-sm text-gray-900 dark:text-white">
                            {notification.message}
                          </span>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification._id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-[#0B1416] rounded transition-all"
                        >
                          <X
                            size={16}
                            className="text-gray-500 dark:text-gray-400"
                          />
                        </button>
                      </div>

                      {notification.post && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug mb-1">
                          Post: {notification.post.title}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center bg-white dark:bg-[#0B1416] border-t border-gray-200 dark:border-[#1A282D]">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500 mb-2">
          <a href="#" className="hover:underline">
            Reddit Rules
          </a>
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            User Agreement
          </a>
          <a href="#" className="hover:underline">
            Accessibility
          </a>
        </div>
        <div className="text-xs text-gray-500">
          Reddit, Inc. © 2025. All rights reserved.
        </div>
      </footer>
      {/* Create Community Popup */}
      {isPopupOpen && (
        <CreateCommunityFlow onClose={() => setIsPopupOpen(false)} />
      )}
    </div>
  );
};

export default Notification;
