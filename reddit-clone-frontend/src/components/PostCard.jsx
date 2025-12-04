import React, { useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Share2,
  Bookmark,
  BookmarkCheck,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import postService from "../services/postService";
import userService from "../services/userService";
import { useAuth } from "../context/AuthContext";

export default function PostCard({
  post,
  onDelete,
  isSaved: initialSaved = false,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Calculate initial vote count and status
  const upvotesCount = post.upvotes?.length || 0;
  const downvotesCount = post.downvotes?.length || 0;
  const initialVotes = upvotesCount - downvotesCount;

  const [votes, setVotes] = useState(initialVotes);
  const [voteStatus, setVoteStatus] = useState(
    post.upvotes?.includes(user?.id)
      ? "up"
      : post.downvotes?.includes(user?.id)
      ? "down"
      : null
  );
  const [isVoting, setIsVoting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpvote = async (e) => {
    e.stopPropagation();
    if (isVoting) return;
    setIsVoting(true);
    try {
      await postService.votePost(post._id, "upvote");
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
      await postService.votePost(post._id, "downvote");
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

  const handleSave = async (e) => {
    e.stopPropagation();
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
      alert(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    setIsDeleting(true);
    try {
      await postService.deletePost(post._id);
      if (onDelete) {
        onDelete(post._id);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete post");
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
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

  // Check if the URL is a video
  const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
    return videoExtensions.some((ext) => url.toLowerCase().includes(ext));
  };

  const isAuthor = user?.id === post.author?._id;

  return (
    <div className="bg-gray-100 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-lg mb-4 hover:border-gray-400 dark:hover:border-zinc-700 transition-colors">
      {/* Post Header */}
      <div className="flex items-center gap-2 p-3 pb-2">
        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">r</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
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

        {/* Menu Button */}
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
              {isAuthor && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? "Deleting..." : "Delete Post"}</span>
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
              >
                Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Title */}
      <div
        className="px-3 pb-2 cursor-pointer"
        onClick={() => navigate(`/post/${post._id}`)}
      >
        <h2 className="text-gray-900 dark:text-white text-lg font-medium hover:underline">
          {post.title}
        </h2>
      </div>

      {/* Post Content */}
      {post.type === "text" && post.content && (
        <div className="px-3 pb-2">
          <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
            {post.content}
          </p>
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
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-500 hover:underline text-sm break-all"
          >
            {post.link}
          </a>
        </div>
      )}

      {/* Post Actions */}
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

        {/* Comments */}
        <button
          onClick={() => navigate(`/post/${post._id}`)}
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-300 dark:hover:bg-zinc-700 rounded-full transition-colors"
        >
          <MessageSquare className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {post.comments?.length || 0}
          </span>
        </button>

        {/* Share */}
        <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-300 dark:hover:bg-zinc-700 rounded-full transition-colors">
          <Share2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Share
          </span>
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="ml-auto p-2 hover:bg-gray-300 dark:hover:bg-zinc-700 rounded-full transition-colors disabled:opacity-50"
          title={isSaved ? "Unsave" : "Save"}
        >
          {isSaved ? (
            <BookmarkCheck className="w-5 h-5 text-blue-500" />
          ) : (
            <Bookmark className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
}
