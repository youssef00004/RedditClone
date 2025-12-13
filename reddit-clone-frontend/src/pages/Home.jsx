import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import PostCard from "../components/PostCard";
import { Loader2, Users } from "lucide-react";
import CreateCommunityFlow from "./CreateCommunityFlow";
import postService from "../services/postService";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch posts on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    } else {
      // Redirect to /all if not authenticated
      navigate("/all");
    }
  }, [isAuthenticated]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");
      // Use following feed instead of regular feed
      const data = await postService.getFollowingFeed();
      setPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  // Handle post deletion (refresh feed)
  const handlePostDeleted = (postId) => {
    setPosts(posts.filter((post) => post._id !== postId));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-white transition-colors">
      {/* Fixed Navbar */}
      <Navbar />

      {/* Main Layout - starts below navbar */}
      <div className="pt-14 flex">
        {/* Sidebar */}
        <Sidebar setIsPopupOpen={setIsPopupOpen} />

        {/* Content Area */}
        <div className="flex-1 flex justify-center">
          <main className="w-full max-w-3xl p-2 sm:p-4">
            {/* Feed Header */}
            <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <h1 className="text-xl sm:text-2xl font-bold">Your Feed</h1>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
                  Posts from communities you joined and users you follow
                </p>
              </div>
              <button
                onClick={() => navigate("/all")}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
              >
                View All Posts
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
                <p className="font-medium">Error loading posts</p>
                <p className="text-sm mt-1">{error}</p>
                <button
                  onClick={fetchPosts}
                  className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && posts.length === 0 && (
              <div className="bg-gray-100 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-lg p-6 sm:p-12 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  Your feed is empty
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-3 sm:mb-4">
                  Join communities or follow users to see their posts here
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                  <button
                    onClick={() => navigate("/communities")}
                    className="px-4 sm:px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium text-sm sm:text-base"
                  >
                    Browse Communities
                  </button>
                  <button
                    onClick={() => navigate("/all")}
                    className="px-4 sm:px-6 py-2 bg-gray-300 dark:bg-zinc-700 hover:bg-gray-400 dark:hover:bg-zinc-600 text-gray-900 dark:text-white rounded-full font-medium text-sm sm:text-base"
                  >
                    View All Posts
                  </button>
                </div>
              </div>
            )}

            {/* Posts */}
            {!loading &&
              !error &&
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDelete={handlePostDeleted}
                />
              ))}

            {/* Load More Button (optional) */}
            {!loading && !error && posts.length > 0 && (
              <div className="flex justify-center mt-4 sm:mt-6">
                <button className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-full font-medium transition-colors">
                  Load More
                </button>
              </div>
            )}
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
