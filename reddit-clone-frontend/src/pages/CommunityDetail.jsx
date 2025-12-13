import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  UserMinus,
  Loader2,
  Plus,
  ChevronDown,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import PostCard from "../components/PostCard";
import communityService from "../services/communityService";
import postService from "../services/postService";
import { useAuth } from "../context/AuthContext";
import CreateCommunityFlow from "./CreateCommunityFlow";
import { showError } from "../utils/toast";

export default function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    fetchCommunity();
    fetchPosts();
  }, [id]);

  const fetchCommunity = async () => {
    try {
      setLoading(true);
      const data = await communityService.getCommunityById(id);
      setCommunity(data);
      setError("");
    } catch (err) {
      setError(err.toString() || "Failed to load community");
      console.error("Error fetching community:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      const data = await postService.getCommunityPosts(id);
      setPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      setActionLoading(true);
      await communityService.joinCommunity(id);
      await fetchCommunity();
    } catch (err) {
      showError(err.toString() || "Failed to join community");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm("Are you sure you want to leave this community?"))
      return;

    try {
      setActionLoading(true);
      await communityService.leaveCommunity(id);
      await fetchCommunity();
    } catch (err) {
      showError(err.toString() || "Failed to leave community");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter((post) => post._id !== postId));
  };

  const isMember = community?.members?.some(
    (member) => member._id === user?.id || member === user?.id
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <Navbar />
        <div className="pt-14 flex items-center justify-center h-screen">
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <Navbar />
        <div className="pt-14 flex items-center justify-center h-screen px-4">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Community not found
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
              {error || "This community doesn't exist"}
            </p>
            <button
              onClick={() => navigate("/communities")}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm sm:text-base"
            >
              Browse Communities
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-white">
      <Navbar />

      <div className="pt-14 flex">
        <Sidebar setIsPopupOpen={setIsPopupOpen} />

        <div className="flex-1 flex justify-center">
          <main className="w-full max-w-5xl">
            {/* Banner */}
            <div className="h-12 sm:h-16 bg-[#1E2B33] rounded-lg sm:rounded-xl mt-1 sm:mt-2"></div>

            {/* Community Info */}
            <div>
              <div className="p-2 sm:p-3">
                <div className="flex flex-col sm:flex-row items-start justify-between mb-3 sm:mb-4 gap-3">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center -mt-8 sm:-mt-12 border-3 sm:border-4 border-gray-100 dark:border-zinc-900 ml-2 sm:ml-3 flex-shrink-0">
                      <span className="text-white font-bold text-xl sm:text-3xl">
                        {community.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-3xl font-bold">r/{community.name}</h1>
                    </div>
                  </div>

                  <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => isAuthenticated ? navigate("/create") : navigate("/login")}
                      className="flex items-center justify-center space-x-1 border border-gray-700 rounded-full py-1.5 sm:py-1.5 px-3 sm:px-4 hover:bg-gray-200 dark:hover:bg-zinc-800 transition duration-150 flex-1 sm:flex-initial"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-semibold text-sm sm:text-base">Create Post</span>
                    </button>
                    {isMember ? (
                      <button
                        onClick={handleLeave}
                        disabled={actionLoading}
                        className="px-4 sm:px-6 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-3xl font-medium transition flex items-center justify-center gap-1.5 sm:gap-2 disabled:cursor-not-allowed text-sm sm:text-base flex-1 sm:flex-initial"
                      >
                        {actionLoading ? (
                          <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-3xl animate-spin" />
                        ) : (
                          <UserMinus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                        Leave
                      </button>
                    ) : (
                      <button
                        onClick={() => isAuthenticated ? handleJoin() : navigate("/login")}
                        disabled={actionLoading}
                        className="px-4 sm:px-6 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition flex items-center justify-center gap-1.5 sm:gap-2 disabled:cursor-not-allowed text-sm sm:text-base flex-1 sm:flex-initial"
                      >
                        {actionLoading ? (
                          <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                        ) : (
                          <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                        Join
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-2 sm:p-4 md:p-6">
              <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
                {/* Main Content - Posts Feed */}
                <div className="flex-1">
                  {/* Posts Loading State */}
                  {postsLoading && (
                    <div className="flex justify-center py-8 sm:py-12">
                      <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-600" />
                    </div>
                  )}

                  {/* Posts List */}
                  {!postsLoading && posts.length > 0 && (
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                      {posts.map((post) => (
                        <PostCard
                          key={post._id}
                          post={post}
                          onDelete={handlePostDelete}
                        />
                      ))}
                    </div>
                  )}

                  {/* No Posts Message */}
                  {!postsLoading && posts.length === 0 && (
                    <div className="bg-gray-100 dark:bg-zinc-900 rounded-lg p-6 sm:p-8 text-center border border-gray-300 dark:border-zinc-800">
                      <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">
                        No posts yet
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                        Be the first to post in this community!
                      </p>
                    </div>
                  )}
                </div>

                {/* Sidebar - Hidden on mobile, visible on large screens */}
                <div className="w-full lg:w-80">
                  <div className="bg-white dark:bg-black rounded-lg border border-gray-300 dark:border-zinc-800 overflow-hidden">
                    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                      <div>
                        <h1 className="text-lg sm:text-xl text-black dark:text-white font-semibold">
                          {community.name}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-1">
                          {community.description || "No description"}
                        </p>
                      </div>
                      <div className="border-t border-gray-300 dark:border-zinc-800 pt-3 sm:pt-4">
                        <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">
                            Members
                          </span>
                          <span className="font-semibold">
                            {community.members?.length || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">
                            Posts
                          </span>
                          <span className="font-semibold">{posts.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Created
                          </span>
                          <span className="font-semibold text-xs sm:text-sm">
                            {new Date(community.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="border-t border-gray-300 dark:border-zinc-800 pt-3 sm:pt-4 pb-2">
                        <h4 className="font-semibold mb-2 text-sm sm:text-base">Created by</h4>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs sm:text-sm font-bold">
                              {community.creator?.username
                                ?.charAt(0)
                                .toUpperCase() || "U"}
                            </span>
                          </div>
                          <span className="text-xs sm:text-sm">
                            u/{community.creator?.username || "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
