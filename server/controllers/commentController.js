import Comment from "../models/comment.js";
import Post from "../models/post.js";

// Create a new comment or reply
export const createComment = async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // If replying to a comment, verify parent exists
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
    }

    const comment = await Comment.create({
      content,
      author: req.user.id,
      post: postId,
      parentComment: parentCommentId || null,
    });

    // Populate author info before sending response
    await comment.populate("author", "username avatar");

    res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get comments for a specific post (organized hierarchically)
export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    // Get all comments for this post
    const comments = await Comment.find({ post: postId })
      .populate("author", "username avatar")
      .sort({ createdAt: -1 });

    // Organize into parent comments and replies
    const commentMap = {};
    const topLevelComments = [];

    // First pass: create a map of all comments
    comments.forEach((comment) => {
      commentMap[comment._id] = {
        ...comment.toObject(),
        replies: [],
      };
    });

    // Second pass: organize into hierarchy
    comments.forEach((comment) => {
      if (comment.parentComment) {
        // This is a reply
        if (commentMap[comment.parentComment]) {
          commentMap[comment.parentComment].replies.push(
            commentMap[comment._id]
          );
        }
      } else {
        // This is a top-level comment
        topLevelComments.push(commentMap[comment._id]);
      }
    });

    res.json(topLevelComments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own comments" });
    }

    // Delete the comment and all its replies
    await Comment.deleteMany({
      $or: [{ _id: commentId }, { parentComment: commentId }],
    });

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
