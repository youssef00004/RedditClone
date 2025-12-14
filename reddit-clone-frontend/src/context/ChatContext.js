import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import chatService from "../services/chatService";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});

  // Use ref to track active conversation in socket handlers
  const activeConversationRef = useRef(null);

  // Keep ref in sync with state
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated) {
      const newSocket = io(
        process.env.REACT_APP_SOCKET_URL || "http://localhost:5000",
        {
          withCredentials: true, // Send httpOnly cookies with socket connection
          transports: ["websocket", "polling"],
        }
      );

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      newSocket.on("user_online", ({ odId }) => {
        setOnlineUsers((prev) => new Set([...prev, odId]));
      });

      newSocket.on("user_offline", ({ odId }) => {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(odId);
          return newSet;
        });
      });

      newSocket.on("new_message", ({ conversationId, message }) => {
        console.log("Received new_message:", conversationId, message);

        // Update messages if this is the active conversation
        const currentActive = activeConversationRef.current;
        if (currentActive?._id === conversationId) {
          setMessages((prev) => {
            // Prevent duplicates
            if (prev.find((m) => m._id === message._id)) {
              return prev;
            }
            return [...prev, message];
          });
        }

        // Update conversation list
        setConversations((prev) =>
          prev
            .map((conv) =>
              conv._id === conversationId
                ? {
                    ...conv,
                    lastMessage: message,
                    updatedAt: new Date().toISOString(),
                  }
                : conv
            )
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        );
      });

      newSocket.on("message_notification", ({ conversationId, message }) => {
        console.log("Received message_notification:", conversationId);
        const currentActive = activeConversationRef.current;

        // Increment unread count if chat is not open or different conversation
        if (!isChatOpen || currentActive?._id !== conversationId) {
          setUnreadCount((prev) => prev + 1);
          setConversations((prev) =>
            prev.map((conv) =>
              conv._id === conversationId
                ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1 }
                : conv
            )
          );
        }
      });

      newSocket.on("user_typing", ({ conversationId, odId }) => {
        setTypingUsers((prev) => ({ ...prev, [conversationId]: odId }));
      });

      newSocket.on("user_stopped_typing", ({ conversationId }) => {
        setTypingUsers((prev) => {
          const newTyping = { ...prev };
          delete newTyping[conversationId];
          return newTyping;
        });
      });

      newSocket.on("error", (error) => {
        console.error("Socket error:", error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, isChatOpen]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const data = await chatService.getConversations();
        setConversations(data);

        // Join all conversation rooms
        if (socket && socket.connected) {
          socket.emit(
            "join_conversations",
            data.map((c) => c._id)
          );
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    }
  }, [isAuthenticated, socket]);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const data = await chatService.getUnreadCount();
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error("Error loading unread count:", error);
      }
    }
  }, [isAuthenticated]);

  // Load conversations when socket connects
  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        loadConversations();
      });
    }
  }, [socket, loadConversations]);

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
      loadUnreadCount();
    }
  }, [isAuthenticated, loadConversations, loadUnreadCount]);

  // Load messages for a conversation
  const loadMessages = async (conversationId) => {
    try {
      const data = await chatService.getMessages(conversationId);
      setMessages(data);

      // Join the conversation room
      if (socket && socket.connected) {
        socket.emit("join_conversation", conversationId);
        socket.emit("mark_read", { conversationId });
      }

      // Update local unread count
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
      loadUnreadCount();
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  // Send message via socket
  const sendMessage = (content) => {
    if (socket && socket.connected && activeConversation && content.trim()) {
      console.log(
        "Sending message:",
        content,
        "to conversation:",
        activeConversation._id
      );
      socket.emit("send_message", {
        conversationId: activeConversation._id,
        content: content.trim(),
      });
    } else {
      console.error(
        "Cannot send message - socket:",
        socket?.connected,
        "activeConv:",
        activeConversation?._id
      );
    }
  };

  // Start typing
  const startTyping = () => {
    if (socket && socket.connected && activeConversation) {
      socket.emit("typing_start", { conversationId: activeConversation._id });
    }
  };

  // Stop typing
  const stopTyping = () => {
    if (socket && socket.connected && activeConversation) {
      socket.emit("typing_stop", { conversationId: activeConversation._id });
    }
  };

  // Start new conversation
  const startConversation = async (participantId) => {
    try {
      // Prevent chatting with self
      if (participantId === user?._id || participantId === user?.id) {
        throw new Error("Cannot start a conversation with yourself");
      }

      const conversation = await chatService.getOrCreateConversation(
        participantId
      );
      setActiveConversation(conversation);

      // Add to conversations if new
      setConversations((prev) => {
        if (!prev.find((c) => c._id === conversation._id)) {
          return [conversation, ...prev];
        }
        return prev;
      });

      // Join room
      if (socket && socket.connected) {
        socket.emit("join_conversation", conversation._id);
      }

      await loadMessages(conversation._id);
      return conversation;
    } catch (error) {
      console.error("Error starting conversation:", error);
      throw error;
    }
  };

  // Select conversation
  const selectConversation = async (conversation) => {
    setActiveConversation(conversation);
    await loadMessages(conversation._id);
  };

  const value = {
    socket,
    conversations,
    activeConversation,
    messages,
    onlineUsers,
    unreadCount,
    isChatOpen,
    typingUsers,
    setIsChatOpen,
    loadConversations,
    sendMessage,
    startTyping,
    stopTyping,
    startConversation,
    selectConversation,
    setActiveConversation,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
