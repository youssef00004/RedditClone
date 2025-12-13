import React, { useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Bookmark,
  BookmarkCheck,
  MoreHorizontal,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import postService from "../services/postService";
import userService from "../services/userService";
import aiService from "../services/aiService";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "./ConfirmModal";
import { showError } from "../utils/toast";
import { formatTimeAgo } from "../utils/dateUtils";
import { useVoting } from "../hooks/useVoting";

export default function PostCard({
  post,
  onDelete,
  isSaved: initialSaved = false,
}) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Use custom voting hook
  const { votes, voteStatus, isVoting, handleUpvote, handleDownvote } = useVoting(
    post.upvotes?.length || 0,
    post.downvotes?.length || 0,
    user?.id,
    post.upvotes || [],
    post.downvotes || [],
    () => postService.votePost(post._id, "upvote"),
    () => postService.votePost(post._id, "downvote")
  );

  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isSaving, setIsSaving] = useState(false);
  const [summary, setSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);


  const handleSave = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showError("Please log in to save posts");
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (isSaved) {
        await userService.unsavePost(post._id);
        setIsSaved(false);
      } else {
        await userService.savePost(post._id);
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Save error:", error);
      showError(typeof error === "string" ? error : error.message || "Failed to save post");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await postService.deletePost(post._id);
      setShowDeleteModal(false);
      if (onDelete) {
        onDelete(post._id);
      }
    } catch (error) {
      console.error("Delete error:", error);
      showError("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSummarize = async (e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      showError("Please log in to use AI features");
      return;
    }

    // If already have summary, just toggle display
    if (summary) {
      setShowSummary(!showSummary);
      return;
    }

    // Fetch summary from API
    setIsSummarizing(true);
    try {
      const data = await aiService.summarizePost(post._id);
      setSummary(data.summary);
      setShowSummary(true);
    } catch (error) {
      console.error("Summarize error:", error);
      const errorMessage =
        typeof error === "string"
          ? error
          : error.message ||
            "Failed to summarize post. Please check your OpenAI API key.";
      showError(errorMessage);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Check if the URL is a video
  const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
    return videoExtensions.some((ext) => url.toLowerCase().includes(ext));
  };

  // Ensure URL has proper protocol
  const ensureProtocol = (url) => {
    if (!url) return "";
    // If URL already has a protocol, return as is
    if (url.match(/^[a-zA-Z][a-zA-Z\d+\-.]*:/)) {
      return url;
    }
    // Otherwise, add https://
    return `https://${url}`;
  };

  const isAuthor = user?.id === post.author?._id;

  return (
    <div className="bg-white dark:bg-black border border-gray-300 dark:border-zinc-800 rounded-lg mb-3 sm:mb-4 hover:border-gray-400 dark:hover:border-zinc-700 transition-colors">
      {/* Post Header */}
      <div className="flex items-center gap-2 p-2 sm:p-3 pb-2">
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">
            {post.community?.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-wrap">
          <span
            className="text-gray-900 dark:text-white font-medium cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/community/${post.community?._id}`);
            }}
          >
            r/{post.community?.name || "unknown"}
          </span>
          <span className="text-gray-500 dark:text-gray-400">•</span>
          <span
            className="text-gray-500 dark:text-gray-400 cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/user/${post.author?.username}`);
            }}
          >
            Posted by u/{post.author?.username || "deleted"}
          </span>
          <span className="text-gray-500 dark:text-gray-400">•</span>
          <span className="text-gray-500 dark:text-gray-400">
            {formatTimeAgo(post.createdAt)}
          </span>
        </div>

        {/* Menu Button - Only for post author */}
        {isAuthor && (
          <div className="ml-auto relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-lg z-10">
                <button
                  onClick={handleDeleteClick}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Post</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Title */}
      <div
        className="px-2 sm:px-3 pb-2 cursor-pointer"
        onClick={() => navigate(`/post/${post._id}`)}
      >
        <h2 className="text-gray-900 dark:text-white text-base sm:text-lg font-medium hover:underline break-words">
          {post.title}
        </h2>
      </div>

      {/* Post Content */}
      {post.type === "text" && post.content && (
        <div className="px-2 sm:px-3 pb-2">
          <p
            className={`text-gray-700 dark:text-gray-300 text-sm sm:text-base break-words ${
              !isExpanded ? "line-clamp-3" : ""
            }`}
          >
            {post.content}
          </p>
          {/* Show More/Less button only if content is long enough */}
          {post.content.length > 200 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium mt-1"
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}

      {/* AI Summary */}
      {showSummary && summary && (
        <div className="mx-3 mb-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase">
              AI Summary
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{summary}</p>
        </div>
      )}

      {/* Post Image/Video */}
      {post.type === "image" && post.image && (
        <div className="relative bg-gray-100 dark:bg-zinc-950">
          {isVideo(post.image) ? (
            <video
              controls
              className="w-full max-h-[600px] object-contain cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <source src={post.image} type="video/mp4" />
              <source src={post.image} type="video/webm" />
              <source src={post.image} type="video/ogg" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={post.image}
              alt={post.title}
              className="w-full max-h-[600px] object-contain cursor-pointer"
              onClick={() => navigate(`/post/${post._id}`)}
            />
          )}
        </div>
      )}

      {/* Post Link */}
      {post.type === "link" && post.link && (
        <div className="px-3 pb-2">
          <a
            href={ensureProtocol(post.link)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-500 dark:text-blue-400 hover:underline text-sm break-all"
          >
            {post.link}
          </a>
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center gap-1 sm:gap-2 p-2 flex-wrap">
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

        {/* Comments */}
        <button
          onClick={() => navigate(`/post/${post._id}`)}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-300 dark:hover:bg-zinc-700 rounded-full transition-colors"
        >
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">
            {post.comments?.length || 0}
          </span>
        </button>

        {/* Summarize - Only show for text posts with content */}
        {post.type === "text" && post.content && (
          <button
            onClick={handleSummarize}
            disabled={isSummarizing || !isAuthenticated}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full transition-colors disabled:opacity-50 ${
              !isAuthenticated
                ? "cursor-not-allowed"
                : "hover:bg-gray-300 dark:hover:bg-zinc-700"
            }`}
            title={!isAuthenticated ? "Log in to use AI features" : "Summarize with AI"}
          >
            <Sparkles
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                showSummary
                  ? "text-purple-500"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            />
            <span
              className={`text-xs sm:text-sm font-medium hidden sm:inline ${
                showSummary
                  ? "text-purple-500"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {isSummarizing
                ? "Summarizing..."
                : showSummary
                ? "Hide"
                : "Summarize"}
            </span>
          </button>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={isSaving || !isAuthenticated}
          className={`ml-auto p-1.5 sm:p-2 rounded-full transition-colors disabled:opacity-50 ${
            !isAuthenticated
              ? "cursor-not-allowed"
              : "hover:bg-gray-300 dark:hover:bg-zinc-700"
          }`}
          title={!isAuthenticated ? "Log in to save posts" : isSaved ? "Unsave" : "Save"}
        >
          {isSaved ? (
            <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          ) : (
            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Post?"
        message="This post will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
}
