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

export default function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

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
      alert(err.toString() || "Failed to join community");
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
      alert(err.toString() || "Failed to leave community");
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
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <Navbar />
        <div className="pt-14 flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Community not found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || "This community doesn't exist"}
            </p>
            <button
              onClick={() => navigate("/communities")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
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
            <div className="h-16 bg-[#1E2B33] rounded-xl mt-2"></div>

            {/* Community Info */}
            <div>
              <div className="p-3">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center -mt-12 border-4 border-gray-100 dark:border-zinc-900 ml-3">
                      <span className="text-white font-bold text-3xl ">
                        {community.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold">r/{community.name}</h1>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate("/create")}
                      className="flex items-center space-x-1 border border-white rounded-full py-1.5 px-4 hover:bg-gray-700 transition duration-150"
                    >
                      <Plus size={18} />
                      <span className="font-semibold">Create Post</span>
                    </button>
                    {isMember ? (
                      <button
                        onClick={handleLeave}
                        disabled={actionLoading}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-3xl font-medium transition flex items-center gap-2 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? (
                          <Loader2 className="w-4 h-4 rounded-3xl animate-spin" />
                        ) : (
                          <UserMinus className="w-4 h-4" />
                        )}
                        Leave
                      </button>
                    ) : (
                      <button
                        onClick={handleJoin}
                        disabled={actionLoading}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition flex items-center gap-2 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                        Join
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6">
              <div className="flex gap-6">
                {/* Main Content - Posts Feed */}
                <div className="flex-1">
                  {/* Posts Loading State */}
                  {postsLoading && (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  )}

                  {/* Posts List */}
                  {!postsLoading && posts.length > 0 && (
                    <div className="space-y-4">
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
                    <div className="bg-gray-100 dark:bg-zinc-900 rounded-lg p-8 text-center border border-gray-300 dark:border-zinc-800">
                      <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        No posts yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Be the first to post in this community!
                      </p>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="w-80">
                  <div className="bg-gray-100 dark:bg-zinc-900 rounded-lg border border-gray-300 dark:border-zinc-800 overflow-hidden">
                    <div className="p-2 space-y-4">
                      <div>
                        <h1 className="text-xl text-gray-200 font-semibold">
                          {community.name}
                        </h1>
                        <p className="text-m text-gray-500 ">
                          {community.description || "No description"}
                        </p>
                      </div>
                      <div className="border-t border-gray-300 dark:border-zinc-800 pt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">
                            Members
                          </span>
                          <span className="font-semibold">
                            {community.members?.length || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">
                            Posts
                          </span>
                          <span className="font-semibold">{posts.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Created
                          </span>
                          <span className="font-semibold">
                            {new Date(community.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="border-t border-gray-300 dark:border-zinc-800 pt-4 pb-2">
                        <h4 className="font-semibold mb-2">Created by</h4>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {community.creator?.username
                                ?.charAt(0)
                                .toUpperCase() || "U"}
                            </span>
                          </div>
                          <span className="text-sm">
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
