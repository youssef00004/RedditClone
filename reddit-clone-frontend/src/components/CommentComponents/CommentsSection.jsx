import React, { useState, useEffect } from "react";
import { ChevronDown, Loader2, X } from "lucide-react";
import CommentItem from "./CommentItem";
import commentService from "../../services/commentService";
import { useAuth } from "../../context/AuthContext";
import { showError } from "../../utils/toast";

export default function CommentsSection({ postId }) {
  const { user, isAuthenticated } = useAuth();
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
      showError(err || "Failed to post comment");
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
      showError(err || "Failed to post reply");
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
    <div className="space-y-3 sm:space-y-4">
      {/* Add Comment Form - Only show if authenticated */}
      {isAuthenticated ? (
        <div className="bg-white dark:bg-black border border-gray-300 dark:border-zinc-800 rounded-lg p-3 sm:p-4">
          <form onSubmit={handleSubmitComment}>
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <textarea
                  placeholder="What are your thoughts?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={submitting}
                  rows={3}
                  className="w-full bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 text-sm"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className={`px-4 sm:px-6 py-2 rounded-full font-medium transition text-sm ${
                      newComment.trim() && !submitting
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-zinc-900 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {submitting ? "Posting..." : "Comment"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white dark:bg-black border border-gray-300 dark:border-zinc-800 rounded-lg p-4 sm:p-6 text-center">
          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-3">
            Log in to join the discussion
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="px-4 sm:px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium text-sm transition-colors"
          >
            Log In
          </button>
        </div>
      )}

      {/* Reply Form (shown when replying) */}
      {replyTo && (
        <div className="bg-white dark:bg-black border border-gray-300 dark:border-zinc-800 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              Replying to comment
            </span>
            <button
              onClick={() => setReplyTo(null)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmitReply}>
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <textarea
                  placeholder="Write your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  disabled={submitting}
                  rows={3}
                  autoFocus
                  className="w-full bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 text-sm"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="px-4 sm:px-6 py-2 bg-gray-200 dark:bg-zinc-900 hover:bg-gray-300 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-400 rounded-full font-medium text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!replyContent.trim() || submitting}
                    className={`px-4 sm:px-6 py-2 rounded-full font-medium transition text-sm ${
                      replyContent.trim() && !submitting
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-zinc-900 text-gray-400 dark:text-gray-500 cursor-not-allowed"
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
      <div className="bg-white dark:bg-black border border-gray-300 dark:border-zinc-800 rounded-lg p-3 sm:p-4">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-6 sm:py-8">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-3 sm:px-4 py-3 rounded-lg">
            <p className="font-medium text-sm sm:text-base">
              Error loading comments
            </p>
            <p className="text-xs sm:text-sm mt-1">{error}</p>
            <button
              onClick={fetchComments}
              className="mt-3 px-3 sm:px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && comments.length === 0 && (
          <div className="text-center py-6 sm:py-8">
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
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
