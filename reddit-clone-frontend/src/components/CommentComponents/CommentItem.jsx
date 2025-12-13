import React, { useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import commentService from "../../services/commentService";
import { useAuth } from "../../context/AuthContext";
import ConfirmModal from "../ConfirmModal";
import { showError } from "../../utils/toast";
import { formatTimeAgo } from "../../utils/dateUtils";
import { useVoting } from "../../hooks/useVoting";

export default function CommentItem({ comment, onReply, onDelete, level = 0 }) {
  const { user, isAuthenticated } = useAuth();

  // Use custom voting hook
  const { votes, voteStatus, isVoting, handleUpvote, handleDownvote } = useVoting(
    comment.upvotes?.length || 0,
    comment.downvotes?.length || 0,
    user?.id,
    comment.upvotes || [],
    comment.downvotes || [],
    () => commentService.voteComment(comment._id, "upvote"),
    () => commentService.voteComment(comment._id, "downvote")
  );

  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await commentService.deleteComment(comment._id);
      setShowDeleteModal(false);
      if (onDelete) {
        onDelete(comment._id);
      }
    } catch (error) {
      console.error("Delete error:", error);
      showError("Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  const isAuthor = user?.id === comment.author?._id;

  return (
    <div
      className={`${
        level > 0
          ? "ml-4 sm:ml-8 border-l-2 border-gray-300 dark:border-zinc-800 pl-2 sm:pl-4"
          : ""
      } mb-3 sm:mb-4`}
    >
      <div className="flex gap-2 sm:gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {comment.author?.username?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-gray-900 dark:text-white font-medium text-xs sm:text-sm">
              {comment.author?.username || "Deleted User"}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              • {formatTimeAgo(comment.createdAt)}
            </span>

            {/* Menu - Only for author */}
            {isAuthor && (
              <div className="ml-auto relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-black border border-gray-300 dark:border-zinc-700 rounded-lg shadow-lg z-10">
                    <button
                      onClick={handleDeleteClick}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comment Text */}
          <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-3 break-words">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            {/* Vote Buttons */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  showError("Please log in to vote");
                  return;
                }
                handleUpvote();
              }}
              disabled={isVoting || !isAuthenticated}
              className={`p-1 rounded transition-colors ${
                voteStatus === "up"
                  ? "text-orange-500"
                  : "text-gray-500 dark:text-gray-400"
              } ${
                !isAuthenticated
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-100 dark:hover:bg-zinc-900 disabled:opacity-50"
              }`}
            >
              <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <span
              className={`text-xs font-medium min-w-[20px] text-center ${
                voteStatus === "up"
                  ? "text-orange-500"
                  : voteStatus === "down"
                  ? "text-blue-500"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {votes}
            </span>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  showError("Please log in to vote");
                  return;
                }
                handleDownvote();
              }}
              disabled={isVoting || !isAuthenticated}
              className={`p-1 rounded transition-colors ${
                voteStatus === "down"
                  ? "text-blue-500"
                  : "text-gray-500 dark:text-gray-400"
              } ${
                !isAuthenticated
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-100 dark:hover:bg-zinc-900 disabled:opacity-50"
              }`}
            >
              <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Reply Button */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  showError("Please log in to reply");
                  return;
                }
                onReply(comment._id);
              }}
              disabled={!isAuthenticated}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors text-gray-500 dark:text-gray-400 text-xs font-medium ${
                !isAuthenticated
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-100 dark:hover:bg-zinc-900"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Reply</span>
            </button>
          </div>

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 sm:mt-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  onReply={onReply}
                  onDelete={onDelete}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Comment?"
        message="This comment will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
}
