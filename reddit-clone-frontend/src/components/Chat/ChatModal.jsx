import React, { useState, useEffect, useRef } from "react";
import { X, Search, Send, ArrowLeft, MessageCircle } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import chatService from "../../services/chatService";
import { showError } from "../../utils/toast";

export default function ChatModal() {
  const {
    isChatOpen,
    setIsChatOpen,
    conversations,
    activeConversation,
    messages,
    onlineUsers,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
    startConversation,
    selectConversation,
    setActiveConversation,
  } = useChat();

  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const results = await chatService.searchUsers(searchQuery);
          // Filter out current user from search results
          const filtered = results.filter(
            (u) => u._id !== user?._id && u._id !== user?.id
          );
          setSearchResults(filtered);
        } catch (error) {
          console.error("Error searching users:", error);
        }
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, user]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput("");
      stopTyping();
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    // Handle typing indicator
    startTyping();
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1000);
  };

  const handleStartNewChat = async (selectedUser) => {
    // Prevent chatting with self
    if (selectedUser._id === user?._id || selectedUser._id === user?.id) {
      showError("You cannot chat with yourself");
      return;
    }

    try {
      await startConversation(selectedUser._id);
      setShowNewChat(false);
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error starting chat:", error);
      showError(error.response?.data?.message || "Failed to start conversation");
    }
  };

  const getOtherParticipant = (conversation) => {
    if (!conversation?.participants) return null;
    const odId = user?._id || user?.id;
    return conversation.participants.find(
      (p) => p._id !== odId && p._id?.toString() !== odId?.toString()
    );
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOwnMessage = (message) => {
    const odId = user?._id || user?.id;
    const senderId = message.sender?._id || message.sender;
    return senderId === odId || senderId?.toString() === odId?.toString();
  };

  if (!isChatOpen) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-4 sm:right-4 w-auto sm:w-96 h-[calc(100vh-2rem)] sm:h-[500px] max-h-[600px] sm:max-h-[80vh] bg-white dark:bg-black border border-gray-200 dark:border-zinc-700 rounded-lg shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-3 border-b border-gray-200 dark:border-zinc-700 bg-white dark:bg-black">
        {activeConversation ? (
          <>
            <button
              onClick={() => {
                setActiveConversation(null);
                setMessageInput("");
              }}
              className="p-1.5 sm:p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded"
            >
              <ArrowLeft className="w-5 h-5 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="flex items-center gap-2 sm:gap-2 flex-1 justify-center">
              <div className="relative">
                <div className="w-9 h-9 sm:w-8 sm:h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {getOtherParticipant(activeConversation)
                      ?.username?.charAt(0)
                      .toUpperCase() || "?"}
                  </span>
                </div>
                {onlineUsers.has(
                  getOtherParticipant(activeConversation)?._id
                ) && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
                )}
              </div>
              <span className="font-medium text-base sm:text-sm text-gray-900 dark:text-white truncate">
                {getOtherParticipant(activeConversation)?.username || "Unknown"}
              </span>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-semibold text-base sm:text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Messages
            </h3>
            <button
              onClick={() => setShowNewChat(!showNewChat)}
              className="text-sm sm:text-sm text-blue-500 hover:text-blue-600 font-medium"
            >
              {showNewChat ? "Cancel" : "New Chat"}
            </button>
          </>
        )}
        <button
          onClick={() => {
            setIsChatOpen(false);
            setActiveConversation(null);
            setShowNewChat(false);
            setSearchQuery("");
          }}
          className="p-1.5 sm:p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded"
        >
          <X className="w-5 h-5 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {showNewChat ? (
          // New Chat Search
          <div className="p-3 sm:p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-2 text-base sm:text-sm bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="mt-3 space-y-1 max-h-80 overflow-y-auto">
              {isSearching ? (
                <p className="text-center text-sm sm:text-sm text-gray-500 py-4">Searching...</p>
              ) : searchResults.length > 0 ? (
                searchResults.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => handleStartNewChat(u)}
                    className="w-full flex items-center gap-3 p-3 sm:p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition"
                  >
                    <div className="w-11 h-11 sm:w-10 sm:h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-base sm:text-sm">
                        {u.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-base sm:text-sm text-gray-900 dark:text-white truncate">
                      {u.username}
                    </span>
                  </button>
                ))
              ) : searchQuery.length >= 2 ? (
                <p className="text-center text-sm sm:text-sm text-gray-500 py-4">No users found</p>
              ) : (
                <p className="text-center text-sm sm:text-sm text-gray-500 py-4">
                  Type at least 2 characters to search
                </p>
              )}
            </div>
          </div>
        ) : activeConversation ? (
          // Messages View
          <>
            <div className="flex-1 overflow-y-auto p-3 sm:p-3 space-y-3 sm:space-y-2">
              {messages.length === 0 ? (
                <p className="text-center text-sm sm:text-sm text-gray-500 py-4">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      isOwnMessage(message) ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] sm:max-w-[70%] px-3 sm:px-3 py-2 sm:py-2 rounded-2xl ${
                        isOwnMessage(message)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                      }`}
                    >
                      <p className="text-base sm:text-sm break-words">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage(message)
                            ? "text-blue-100"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {typingUsers[activeConversation._id] && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-zinc-800 px-3 py-2 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-3 border-t border-gray-200 dark:border-zinc-700"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 sm:py-2 text-base sm:text-sm bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-2.5 sm:p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-zinc-600 disabled:cursor-not-allowed rounded-full transition flex-shrink-0"
                >
                  <Send className="w-5 h-5 sm:w-5 sm:h-5 text-white" />
                </button>
              </div>
            </form>
          </>
        ) : (
          // Conversations List
          <div className="flex-1 overflow-y-auto">
            {conversations.length > 0 ? (
              conversations.map((conversation) => {
                const otherUser = getOtherParticipant(conversation);
                if (!otherUser) return null;

                const isOnline = onlineUsers.has(otherUser._id);

                return (
                  <button
                    key={conversation._id}
                    onClick={() => selectConversation(conversation)}
                    className="w-full flex items-center gap-3 p-3 sm:p-3 hover:bg-gray-50 dark:hover:bg-zinc-800 border-b border-gray-100 dark:border-zinc-800 transition"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-base sm:text-base">
                          {otherUser.username?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-base sm:text-sm text-gray-900 dark:text-white truncate">
                          {otherUser.username}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-sm sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                          {conversation.lastMessage.sender?._id ===
                          (user?._id || user?.id)
                            ? "You: "
                            : ""}
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                <MessageCircle className="w-12 h-12 mb-2" />
                <p className="text-sm sm:text-sm">No conversations yet</p>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="mt-2 text-sm sm:text-sm text-blue-500 hover:text-blue-600"
                >
                  Start a new chat
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
