import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/user.js";

// Get or create a conversation with another user
export const getOrCreateConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user.id;

    // Fix: Convert both to strings for comparison
    if (participantId.toString() === userId.toString()) {
      return res.status(400).json({ message: "Cannot chat with yourself" });
    }

    // Check if participant exists
    const participantExists = await User.findById(participantId);
    if (!participantExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [userId, participantId], $size: 2 },
    }).populate("participants", "username _id");

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        participants: [userId, participantId],
        isGroup: false,
      });
      conversation = await conversation.populate(
        "participants",
        "username _id"
      );
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("getOrCreateConversation error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all conversations for current user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "username _id")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "username _id" },
      })
      .sort({ updatedAt: -1 });

    // Add unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: userId },
          readBy: { $ne: userId },
        });
        return {
          ...conv.toObject(),
          unreadCount,
        };
      })
    );

    res.status(200).json(conversationsWithUnread);
  } catch (error) {
    console.error("getConversations error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "username _id")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        readBy: { $ne: userId },
      },
      { $addToSet: { readBy: userId } }
    );

    res.status(200).json(messages.reverse());
  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Send a message (REST fallback - socket is primary)
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      content: content.trim(),
      readBy: [userId],
    });

    // Update conversation's lastMessage
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    });

    const populatedMessage = await message.populate("sender", "username _id");

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get total unread count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const userConversations = await Conversation.find({
      participants: userId,
    }).distinct("_id");

    const unreadCount = await Message.countDocuments({
      conversation: { $in: userConversations },
      sender: { $ne: userId },
      readBy: { $ne: userId },
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error("getUnreadCount error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Search users to start a chat
export const searchUsersForChat = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id;

    if (!query || query.length < 2) {
      return res.status(200).json([]);
    }

    const users = await User.find({
      _id: { $ne: userId },
      username: { $regex: query, $options: "i" },
    })
      .select("username _id")
      .limit(10);

    res.status(200).json(users);
  } catch (error) {
    console.error("searchUsersForChat error:", error);
    res.status(500).json({ message: error.message });
  }
};
