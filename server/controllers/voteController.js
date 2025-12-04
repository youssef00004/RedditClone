import Post from "../models/post.js";

// Handles upvote or downvote
export const votePost = async (req, res) => {
  try {
    const { type } = req.body; // 'upvote' or 'downvote'
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id;
    const hasUpvoted = post.upvotes.includes(userId);
    const hasDownvoted = post.downvotes.includes(userId);

    if (type === "upvote") {
      // Remove from downvotes if present
      if (hasDownvoted) {
        post.downvotes.pull(userId);
      }

      // Toggle upvote
      if (hasUpvoted) {
        post.upvotes.pull(userId); // Remove if already upvoted
      } else {
        post.upvotes.push(userId);
      }
    } else if (type === "downvote") {
      // Remove from upvotes if present
      if (hasUpvoted) {
        post.upvotes.pull(userId);
      }

      // Toggle downvote
      if (hasDownvoted) {
        post.downvotes.pull(userId); // Remove if already downvoted
      } else {
        post.downvotes.push(userId);
      }
    } else {
      return res.status(400).json({ message: "Invalid vote type" });
    }

    await post.save();

    const votes = post.upvotes.length + post.downvotes.length;
    res.json({
      message: "Vote updated successfully",
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
      totalVotes: votes,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
