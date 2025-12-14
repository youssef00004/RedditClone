import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CommentsSection from "../components/CommentComponents/CommentsSection";
import PostCard from "../components/PostCard";
import { ArrowLeft, Loader2 } from "lucide-react";
import postService from "../services/postService";
import CreateCommunityFlow from "./CreateCommunityFlow";

export default function PostDetail() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await postService.getPostById(postId);
      setPost(data);
    } catch (err) {
      console.error("Error fetching post:", err);
      setError(err || "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (deletedPostId) => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Navbar />
        <div className="pt-14 flex items-center justify-center h-screen">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
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
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />

      <div className="pt-14 flex">
        <Sidebar setIsPopupOpen={setIsPopupOpen} />

        <div className="flex-1 flex justify-center">
          {/* Main Content */}
          <main className="w-full max-w-3xl p-2 sm:p-4">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 dark:text-white" />
              <span className="text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                Back
              </span>
            </button>

            {/* Post Card */}
            <PostCard post={post} onDelete={handleDelete} />

            {/* Comments Section */}
            <CommentsSection postId={postId} />
          </main>
        </div>
      </div>
      {/* Create Community Popup */}
      {isPopupOpen && (
        <CreateCommunityFlow onClose={() => setIsPopupOpen(false)} />
      )}
    </div>
  );
}
