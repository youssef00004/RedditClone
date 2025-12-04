import React, { useState } from "react";
import { ArrowUp, ArrowDown, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import commentService from "../services/commentService";
import { useAuth } from "../context/AuthContext";

export default function UserCommentCard({ comment }) {
  const navigate = useNavigate();
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

  const handleUpvote = async (e) => {
    e.stopPropagation();
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

  const handleDownvote = async (e) => {
    e.stopPropagation();
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

  const handleCardClick = () => {
    if (comment.post?._id) {
      navigate(`/post/${comment.post._id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-gray-100 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-lg mb-4 hover:border-gray-400 dark:hover:border-zinc-700 transition-colors cursor-pointer"
    >
      {/* Comment Header */}
      <div className="flex items-center gap-2 p-3 pb-2">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">
            {comment.author?.username?.charAt(0).toUpperCase() || "U"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-900 dark:text-white font-medium">
            {comment.author?.username || "deleted"}
          </span>
          <span className="text-gray-500 dark:text-gray-400">commented on</span>
          <span
            className="text-blue-500 hover:underline font-medium"
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
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
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
      <div className="px-3 pb-2">
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          {comment.content}
        </p>
      </div>

      {/* Comment Actions */}
      <div className="flex items-center gap-2 p-2">
        {/* Voting */}
        <div className="flex items-center gap-1 bg-gray-200 dark:bg-zinc-800 rounded-full px-2 py-1 transition-colors">
          <button
            onClick={handleUpvote}
            disabled={isVoting}
            className={`p-1 rounded hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors ${
              voteStatus === "up"
                ? "text-orange-500"
                : "text-gray-500 dark:text-gray-400"
            } disabled:opacity-50`}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <span
            className={`text-sm font-medium min-w-[40px] text-center ${
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
            onClick={handleDownvote}
            disabled={isVoting}
            className={`p-1 rounded hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors ${
              voteStatus === "down"
                ? "text-blue-500"
                : "text-gray-500 dark:text-gray-400"
            } disabled:opacity-50`}
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        </div>

        {/* View Context */}
        <button
          onClick={handleCardClick}
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-300 dark:hover:bg-zinc-700 rounded-full transition-colors"
        >
          <MessageSquare className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            View context
          </span>
        </button>
      </div>
    </div>
  );
}
