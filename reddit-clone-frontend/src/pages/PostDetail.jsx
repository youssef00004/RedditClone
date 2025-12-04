import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CommentsSection from "../components/CommentComponents/CommentsSection";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import postService from "../services/postService";
import { useAuth } from "../context/AuthContext";

export default function PostDetail() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [votes, setVotes] = useState(0);
  const [voteStatus, setVoteStatus] = useState(null);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await postService.getPostById(postId);
      setPost(data);

      const upvotesCount = data.upvotes?.length || 0;
      const downvotesCount = data.downvotes?.length || 0;
      setVotes(upvotesCount - downvotesCount);

      setVoteStatus(
        data.upvotes?.includes(user?.id)
          ? "up"
          : data.downvotes?.includes(user?.id)
          ? "down"
          : null
      );
    } catch (err) {
      console.error("Error fetching post:", err);
      setError(err || "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
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

  const handleDownvote = async () => {
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

  const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
    return videoExtensions.some((ext) => url.toLowerCase().includes(ext));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="pt-14 flex items-center justify-center h-screen">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="pt-14 flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-red-500 text-xl mb-4">
              {error || "Post not found"}
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="pt-14 flex">
        <Sidebar />

        <div className="flex-1 flex justify-center">
          {/* Main Content */}
          <main className="w-full max-w-3xl">
            {/* Post Container */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg mb-4 mt-4">
              {/* Back Button & Header */}
              <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-zinc-800 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">r</span>
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">
                      r/{post.community?.name || "unknown"}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {post.author?.username || "deleted"} •{" "}
                      {formatTimeAgo(post.createdAt)}
                    </div>
                  </div>
                </div>
                <button className="ml-auto p-2 hover:bg-zinc-800 rounded">
                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Post Content */}
              <div className="p-4">
                <h1 className="text-white text-2xl font-medium mb-3">
                  {post.title}
                </h1>

                {/* Text Content */}
                {post.type === "text" && post.content && (
                  <div className="text-gray-300 text-sm mb-4 whitespace-pre-wrap">
                    {post.content}
                  </div>
                )}

                {/* Image/Video */}
                {post.type === "image" && post.image && (
                  <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                    {isVideo(post.image) ? (
                      <video
                        controls
                        className="w-full max-h-[600px] object-contain"
                      >
                        <source src={post.image} type="video/mp4" />
                        <source src={post.image} type="video/webm" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full max-h-[600px] object-contain"
                      />
                    )}
                  </div>
                )}

                {/* Link */}
                {post.type === "link" && post.link && (
                  <div className="mb-4">
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline break-all"
                    >
                      {post.link}
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-zinc-800 rounded-full px-2 py-1">
                    <button
                      onClick={handleUpvote}
                      disabled={isVoting}
                      className={`p-1 rounded hover:bg-zinc-700 ${
                        voteStatus === "up"
                          ? "text-orange-500"
                          : "text-gray-400"
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
                          : "text-white"
                      }`}
                    >
                      {votes}
                    </span>
                    <button
                      onClick={handleDownvote}
                      disabled={isVoting}
                      className={`p-1 rounded hover:bg-zinc-700 ${
                        voteStatus === "down"
                          ? "text-blue-500"
                          : "text-gray-400"
                      } disabled:opacity-50`}
                    >
                      <ArrowDown className="w-5 h-5" />
                    </button>
                  </div>

                  <button className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-800 rounded-full">
                    <MessageSquare className="w-5 h-5 text-gray-400" />
                  </button>

                  <button className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-800 rounded-full">
                    <Share2 className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-400 text-sm font-medium">
                      Share
                    </span>
                  </button>

                  <button className="ml-auto p-2 hover:bg-zinc-800 rounded-full">
                    <Bookmark className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <CommentsSection postId={postId} />
          </main>
        </div>
      </div>
    </div>
  );
}
