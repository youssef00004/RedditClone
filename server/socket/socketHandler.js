import jwt from "jsonwebtoken";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

// Store online users: { odId: socketId }
const onlineUsers = new Map();

export const initializeSocket = (io) => {
  // Authentication middleware for socket
  io.use((socket, next) => {
    // Try to get token from cookies first (httpOnly cookie)
    let token = socket.handshake.headers.cookie
      ?.split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    // Fallback to auth token (for backward compatibility)
    if (!token) {
      token = socket.handshake.auth.token;
    }

    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Add user to online users
    onlineUsers.set(socket.userId, socket.id);

    // Broadcast online status
    io.emit("user_online", { odId: socket.userId });

    // Join user to their conversation rooms
    socket.on("join_conversations", (conversationIds) => {
      if (Array.isArray(conversationIds)) {
        conversationIds.forEach((id) => {
          socket.join(id.toString());
          console.log(`User ${socket.userId} joined room ${id}`);
        });
      }
    });

    // Join a single conversation
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId.toString());
      console.log(`User ${socket.userId} joined room ${conversationId}`);
    });

    // Handle sending messages
    socket.on("send_message", async (data) => {
      try {
        const { conversationId, content } = data;

        if (!content || !content.trim()) {
          socket.emit("error", { message: "Message content is required" });
          return;
        }

        // Verify user is participant
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.userId,
        });

        if (!conversation) {
          socket.emit("error", { message: "Conversation not found" });
          return;
        }

        // Create message in database
        const message = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          content: content.trim(),
          readBy: [socket.userId],
        });

        // Update conversation's lastMessage and updatedAt
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          updatedAt: new Date(),
        });

        const populatedMessage = await message.populate(
          "sender",
          "username _id"
        );

        console.log(
          `Message sent in room ${conversationId}:`,
          populatedMessage.content
        );

        // Emit to all users in the conversation room (including sender)
        io.to(conversationId.toString()).emit("new_message", {
          conversationId,
          message: populatedMessage,
        });

        // Send notification to other participants who might not be in the room
        conversation.participants.forEach((participantId) => {
          const odId = participantId.toString();
          if (odId !== socket.userId) {
            const participantSocketId = onlineUsers.get(odId);
            if (participantSocketId) {
              io.to(participantSocketId).emit("message_notification", {
                conversationId,
                message: populatedMessage,
              });
            }
          }
        });
      } catch (error) {
        console.error("Socket send_message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicators
    socket.on("typing_start", ({ conversationId }) => {
      socket.to(conversationId.toString()).emit("user_typing", {
        conversationId,
        odId: socket.userId,
      });
    });

    socket.on("typing_stop", ({ conversationId }) => {
      socket.to(conversationId.toString()).emit("user_stopped_typing", {
        conversationId,
        odId: socket.userId,
      });
    });

    // Handle marking messages as read
    socket.on("mark_read", async ({ conversationId }) => {
      try {
        await Message.updateMany(
          {
            conversation: conversationId,
            sender: { $ne: socket.userId },
            readBy: { $ne: socket.userId },
          },
          { $addToSet: { readBy: socket.userId } }
        );

        socket.to(conversationId.toString()).emit("messages_read", {
          conversationId,
          odId: socket.userId,
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
      onlineUsers.delete(socket.userId);
      io.emit("user_offline", { odId: socket.userId });
    });
  });

  return io;
};

export const getOnlineUsers = () => onlineUsers;
