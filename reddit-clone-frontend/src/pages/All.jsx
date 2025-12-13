import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import PostCard from "../components/PostCard";
import { Loader2 } from "lucide-react";
import CreateCommunityFlow from "./CreateCommunityFlow";
import postService from "../services/postService";
import { useAuth } from "../context/AuthContext";

export default function All() {
  const { isAuthenticated } = useAuth();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all posts on component mount (works for both logged in and logged out users)
  useEffect(() => {
    fetchAllPosts();
  }, []);

  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await postService.getAllPosts();
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
          <main className="w-full max-w-3xl p-4">
            {/* Feed Header */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold mb-1">All Posts</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Browse posts from all communities
              </p>
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
                  onClick={fetchAllPosts}
                  className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && posts.length === 0 && (
              <div className="bg-gray-100 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-lg p-12 text-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400 dark:text-gray-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="9" y1="9" x2="15" y2="9" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Be the first to create a post!
                </p>
                <button
                  onClick={() => setIsPopupOpen(true)}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium"
                >
                  Create a Post
                </button>
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
              <div className="flex justify-center mt-6">
                <button className="px-6 py-3 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-full font-medium transition-colors">
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
