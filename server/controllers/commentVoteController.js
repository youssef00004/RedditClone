import Comment from "../models/comment.js";

// Handles upvote or downvote on comments
export const voteComment = async (req, res) => {
  try {
    const { type } = req.body; // 'upvote' or 'downvote'
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const userId = req.user.id;
    const hasUpvoted = comment.upvotes.includes(userId);
    const hasDownvoted = comment.downvotes.includes(userId);

    if (type === "upvote") {
      // Remove from downvotes if present
      if (hasDownvoted) {
        comment.downvotes.pull(userId);
      }

      // Toggle upvote
      if (hasUpvoted) {
        comment.upvotes.pull(userId); // Remove if already upvoted
      } else {
        comment.upvotes.push(userId);
      }
    } else if (type === "downvote") {
      // Remove from upvotes if present
      if (hasUpvoted) {
        comment.upvotes.pull(userId);
      }

      // Toggle downvote
      if (hasDownvoted) {
        comment.downvotes.pull(userId); // Remove if already downvoted
      } else {
        comment.downvotes.push(userId);
      }
    } else {
      return res.status(400).json({ message: "Invalid vote type" });
    }

    await comment.save();

    res.json({
      message: "Vote updated successfully",
      upvotes: comment.upvotes.length,
      downvotes: comment.downvotes.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
