import React, { useState } from "react";
import { ArrowUp, ArrowDown, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import commentService from "../services/commentService";
import { useAuth } from "../context/AuthContext";
import { formatTimeAgo } from "../utils/dateUtils";
import { useVoting } from "../hooks/useVoting";
import { showError } from "../utils/toast";

export default function UserCommentCard({ comment }) {
  const navigate = useNavigate();
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

  const handleCardClick = () => {
    if (comment.post?._id) {
      navigate(`/post/${comment.post._id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white dark:bg-black border border-gray-300 dark:border-zinc-800 rounded-lg mb-4 hover:border-gray-400 dark:hover:border-zinc-700 transition-colors cursor-pointer"
    >
      {/* Comment Header */}
      <div className="flex items-start gap-2 p-2 sm:p-3 pb-2">
        <div className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs sm:text-sm font-bold">
            {comment.author?.username?.charAt(0).toUpperCase() || "U"}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm min-w-0 flex-1">
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <span className="text-gray-900 dark:text-white font-medium truncate">
              {comment.author?.username || "deleted"}
            </span>
            <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">commented on</span>
            <span className="text-gray-500 dark:text-gray-400 sm:hidden">on</span>
          </div>
          <span
            className="text-blue-500 hover:underline font-medium truncate"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/post/${comment.post?._id}`);
            }}
          >
            {comment.post?.title || "Deleted Post"}
          </span>
        </div>
      </div>

      {/* Post Info */}
      <div className="px-2 sm:px-3 pb-2">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
          <span
            className="hover:underline cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/community/${comment.post?.community?._id}`);
            }}
          >
            r/{comment.post?.community?.name || "unknown"}
          </span>
          <span>•</span>
          <span>{formatTimeAgo(comment.createdAt)}</span>
        </div>
      </div>

      {/* Comment Content */}
      <div className="px-2 sm:px-3 pb-2">
        <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base break-words">
          {comment.content}
        </p>
      </div>

      {/* Comment Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-2">
        {/* Voting */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-200 dark:bg-zinc-800 rounded-full px-1.5 sm:px-2 py-1 transition-colors">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isAuthenticated) {
                showError("Please log in to vote");
                return;
              }
              handleUpvote();
            }}
            disabled={isVoting || !isAuthenticated}
            className={`p-0.5 sm:p-1 rounded transition-colors ${
              voteStatus === "up"
                ? "text-orange-500"
                : "text-gray-500 dark:text-gray-400"
            } ${
              !isAuthenticated
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-300 dark:hover:bg-zinc-700 disabled:opacity-50"
            }`}
          >
            <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <span
            className={`text-xs sm:text-sm font-medium min-w-[30px] sm:min-w-[40px] text-center ${
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
            onClick={(e) => {
              e.stopPropagation();
              if (!isAuthenticated) {
                showError("Please log in to vote");
                return;
              }
              handleDownvote();
            }}
            disabled={isVoting || !isAuthenticated}
            className={`p-0.5 sm:p-1 rounded transition-colors ${
              voteStatus === "down"
                ? "text-blue-500"
                : "text-gray-500 dark:text-gray-400"
            } ${
              !isAuthenticated
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-300 dark:hover:bg-zinc-700 disabled:opacity-50"
            }`}
          >
            <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* View Context */}
        <button
          onClick={handleCardClick}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-300 dark:hover:bg-zinc-700 rounded-full transition-colors"
        >
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">
            {comment.post?.comments?.length || 0}
          </span>
        </button>
      </div>
    </div>
  );
}
