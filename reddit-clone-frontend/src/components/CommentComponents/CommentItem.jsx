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

export default function CommentItem({ comment, onReply, onDelete, level = 0 }) {
  const { user } = useAuth();
  const [votes, setVotes] = useState(
    (comment.upvotes?.length || 0) - (comment.downvotes?.length || 0)
  );
  const [voteStatus, setVoteStatus] = useState(
    comment.upvotes?.includes(user?.id)
      ? "up"
      : comment.downvotes?.includes(user?.id)
      ? "down"
      : null
  );
  const [isVoting, setIsVoting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpvote = async () => {
    if (isVoting) return;
    setIsVoting(true);
    try {
      await commentService.voteComment(comment._id, "upvote");
      if (voteStatus === "up") {
        setVotes(votes - 1);
        setVoteStatus(null);
      } else if (voteStatus === "down") {
        setVotes(votes + 2);
        setVoteStatus("up");
      } else {
        setVotes(votes + 1);
        setVoteStatus("up");
      }
    } catch (error) {
      console.error("Vote error:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleDownvote = async () => {
    if (isVoting) return;
    setIsVoting(true);
    try {
      await commentService.voteComment(comment._id, "downvote");
      if (voteStatus === "down") {
        setVotes(votes + 1);
        setVoteStatus(null);
      } else if (voteStatus === "up") {
        setVotes(votes - 2);
        setVoteStatus("down");
      } else {
        setVotes(votes - 1);
        setVoteStatus("down");
      }
    } catch (error) {
      console.error("Vote error:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    setIsDeleting(true);
    try {
      await commentService.deleteComment(comment._id);
      if (onDelete) {
        onDelete(comment._id);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";

    return Math.floor(seconds) + "s ago";
  };

  const isAuthor = user?.id === comment.author?._id;

  return (
    <div
      className={`${
        level > 0 ? "ml-8 border-l-2 border-zinc-800 pl-4" : ""
      } mb-4`}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {comment.author?.username?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white font-medium text-sm">
              {comment.author?.username || "Deleted User"}
            </span>
            <span className="text-gray-500 text-xs">
              • {formatTimeAgo(comment.createdAt)}
            </span>

            {/* Menu */}
            <div className="ml-auto relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-zinc-800 rounded"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-10">
                  {isAuthor && (
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-500 hover:bg-zinc-700 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowMenu(false)}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-zinc-700"
                  >
                    Report
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Comment Text */}
          <p className="text-gray-300 text-sm mb-3">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Vote Buttons */}
            <button
              onClick={handleUpvote}
              disabled={isVoting}
              className={`p-1 hover:bg-zinc-800 rounded ${
                voteStatus === "up" ? "text-orange-500" : "text-gray-400"
              } disabled:opacity-50`}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <span
              className={`text-xs font-medium ${
                voteStatus === "up"
                  ? "text-orange-500"
                  : voteStatus === "down"
                  ? "text-blue-500"
                  : "text-white"
              }`}
            >
              {votes}
            </span>
            <button
              onClick={handleDownvote}
              disabled={isVoting}
              className={`p-1 hover:bg-zinc-800 rounded ${
                voteStatus === "down" ? "text-blue-500" : "text-gray-400"
              } disabled:opacity-50`}
            >
              <ArrowDown className="w-4 h-4" />
            </button>

            {/* Reply Button */}
            <button
              onClick={() => onReply(comment._id)}
              className="flex items-center gap-1 px-2 py-1 hover:bg-zinc-800 rounded text-gray-400 text-xs font-medium"
            >
              <MessageSquare className="w-4 h-4" />
              Reply
            </button>
          </div>

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
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
    </div>
  );
}
