import React, { useState, useEffect } from "react";
import { ChevronDown, Loader2, X } from "lucide-react";
import CommentItem from "./CommentItem";
import commentService from "../../services/commentService";
import { useAuth } from "../../context/AuthContext";

export default function CommentsSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState("best");

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await commentService.getCommentsByPost(postId);
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError(err || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await commentService.createComment(postId, newComment);
      setNewComment("");
      await fetchComments();
    } catch (err) {
      console.error("Error creating comment:", err);
      alert(err || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyTo) return;

    setSubmitting(true);
    try {
      await commentService.createComment(postId, replyContent, replyTo);
      setReplyContent("");
      setReplyTo(null);
      await fetchComments();
    } catch (err) {
      console.error("Error creating reply:", err);
      alert(err || "Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

  const handleReply = (commentId) => {
    setReplyTo(commentId);
    setReplyContent("");
  };

  return (
    <div className="space-y-4">
      {/* Add Comment Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <form onSubmit={handleSubmitComment}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <textarea
                placeholder="What are your thoughts?"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submitting}
                rows={3}
                className="w-full bg-zinc-800 text-white placeholder-gray-500 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className={`px-6 py-2 rounded-full font-medium transition ${
                    newComment.trim() && !submitting
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-zinc-800 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {submitting ? "Posting..." : "Comment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Reply Form (shown when replying) */}
      {replyTo && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Replying to comment</span>
            <button
              onClick={() => setReplyTo(null)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmitReply}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <textarea
                  placeholder="Write your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  disabled={submitting}
                  rows={3}
                  autoFocus
                  className="w-full bg-zinc-800 text-white placeholder-gray-500 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-gray-400 rounded-full font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!replyContent.trim() || submitting}
                    className={`px-6 py-2 rounded-full font-medium transition ${
                      replyContent.trim() && !submitting
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "bg-zinc-800 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {submitting ? "Replying..." : "Reply"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Comments List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        {/* Sort Options */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-zinc-800">
          <span className="text-gray-400 text-sm">Sort by:</span>
          <button
            onClick={() => setSortBy("best")}
            className={`text-sm font-medium ${
              sortBy === "best" ? "text-white" : "text-gray-400"
            }`}
          >
            Best
          </button>
          <button
            onClick={() => setSortBy("new")}
            className={`text-sm font-medium ${
              sortBy === "new" ? "text-white" : "text-gray-400"
            }`}
          >
            New
          </button>
          <button
            onClick={() => setSortBy("top")}
            className={`text-sm font-medium ${
              sortBy === "top" ? "text-white" : "text-gray-400"
            }`}
          >
            Top
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
            <p className="font-medium">Error loading comments</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchComments}
              className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && comments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">
              No comments yet. Be the first to comment!
            </p>
          </div>
        )}

        {/* Comments */}
        {!loading &&
          !error &&
          comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onReply={handleReply}
              onDelete={handleDeleteComment}
            />
          ))}
      </div>
    </div>
  );
}
