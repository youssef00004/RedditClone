import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Loader2, Calendar, UserPlus, UserMinus } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CreateCommunityFlow from "./CreateCommunityFlow";
import PostCard from "../components/PostCard";
import UserCommentCard from "../components/UserCommentCard";
import { useAuth } from "../context/AuthContext";
import userService from "../services/userService";
import { showError } from "../utils/toast";
import { formatDate } from "../utils/dateUtils";

export default function UserProfile() {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [upvotedPosts, setUpvotedPosts] = useState([]);
  const [upvotedComments, setUpvotedComments] = useState([]);
  const [downvotedPosts, setDownvotedPosts] = useState([]);
  const [downvotedComments, setDownvotedComments] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const tabs = [
    "Overview",
    "Posts",
    "Comments",
    "Saved",
    "Upvoted",
    "Downvoted",
  ];

  useEffect(() => {
    if (username) {
      fetchUserData();
    }
  }, [username]);

  useEffect(() => {
    fetchUserData();
  }, [activeTab]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch user profile
      const userData = await userService.getUserByUsername(username);
      setUser(userData);

      // Check if current user is following this user (only if authenticated)
      if (currentUser?.id) {
        const currentUserData = await userService.getUserProfile(currentUser.id);
        setIsFollowing(
          currentUserData.following?.some((f) => f._id === userData._id) || false
        );
      }

      // Fetch user's posts
      const postsData = await userService.getUserPosts(userData._id);
      setPosts(postsData);

      // Fetch user's comments
      const commentsData = await userService.getUserComments(userData._id);
      setComments(commentsData);

      // Fetch saved posts (only if own profile)
      if (currentUser?.id === userData._id) {
        const savedData = await userService.getUserSavedPosts(userData._id);
        setSavedPosts(savedData);
      }

      // Fetch upvoted content (only if own profile)
      if (currentUser?.id === userData._id) {
        const upvotedPostsData = await userService.getUserUpvotedPosts(
          userData._id
        );
        setUpvotedPosts(upvotedPostsData);

        const upvotedCommentsData = await userService.getUserUpvotedComments(
          userData._id
        );
        setUpvotedComments(upvotedCommentsData);
      }

      // Fetch downvoted content (only if own profile)
      if (currentUser?.id === userData._id) {
        const downvotedPostsData = await userService.getUserDownvotedPosts(
          userData._id
        );
        setDownvotedPosts(downvotedPostsData);

        const downvotedCommentsData =
          await userService.getUserDownvotedComments(userData._id);
        setDownvotedComments(downvotedCommentsData);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err || "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (isFollowLoading) return;
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await userService.unfollowUser(user._id);
        setIsFollowing(false);
        setUser((prev) => ({
          ...prev,
          followers: prev.followers.filter((f) => f._id !== currentUser?.id),
        }));
      } else {
        await userService.followUser(user._id);
        setIsFollowing(true);
        setUser((prev) => ({
          ...prev,
          followers: [
            ...prev.followers,
            { _id: currentUser?.id, username: currentUser?.username },
          ],
        }));
      }
    } catch (err) {
      console.error("Follow error:", err);
      showError(err || "Failed to follow/unfollow user");
    } finally {
      setIsFollowLoading(false);
    }
  };

  const calculateKarma = () => {
    let karma = 0;
    posts.forEach((post) => {
      karma += (post.upvotes?.length || 0) - (post.downvotes?.length || 0);
    });
    comments.forEach((comment) => {
      karma +=
        (comment.upvotes?.length || 0) - (comment.downvotes?.length || 0);
    });
    return karma;
  };

  const calculateRedditAge = () => {
    if (!user?.createdAt) return "0m";
    const now = new Date();
    const created = new Date(user.createdAt);
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays}d`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}m`;
    return `${Math.floor(diffDays / 365)}y`;
  };

  const isOwnProfile = currentUser?.id === user?._id;

  const renderContent = () => {
    switch (activeTab) {
      case "posts":
        return (
          <div>
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">No posts yet</h2>
                <p className="text-sm sm:text-base text-gray-400 text-center max-w-md mb-6 px-4">
                  {isOwnProfile
                    ? "You haven't posted anything yet."
                    : `${user?.username} hasn't posted anything yet.`}
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDelete={() => fetchUserData()}
                  isSaved={savedPosts.some((sp) => sp._id === post._id)}
                />
              ))
            )}
          </div>
        );

      case "comments":
        return (
          <div>
            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">No comments yet</h2>
                <p className="text-sm sm:text-base text-gray-400 text-center max-w-md mb-6 px-4">
                  {isOwnProfile
                    ? "You haven't commented on anything yet."
                    : `${user?.username} hasn't commented on anything yet.`}
                </p>
              </div>
            ) : (
              comments.map((comment) => (
                <UserCommentCard key={comment._id} comment={comment} />
              ))
            )}
          </div>
        );

      case "saved":
        if (!isOwnProfile) {
          return (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Private</h2>
              <p className="text-sm sm:text-base text-gray-400 text-center max-w-md px-4">
                Only User can see his saved posts.
              </p>
            </div>
          );
        }
        return (
          <div>
            {savedPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">No saved posts</h2>
                <p className="text-sm sm:text-base text-gray-400 text-center max-w-md mb-6 px-4">
                  Save posts to view them later.
                </p>
              </div>
            ) : (
              savedPosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDelete={() => fetchUserData()}
                  isSaved={true}
                />
              ))
            )}
          </div>
        );

      case "upvoted":
        if (!isOwnProfile) {
          return (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Private</h2>
              <p className="text-sm sm:text-base text-gray-400 text-center max-w-md px-4">
                Only User can see his upvoted content.
              </p>
            </div>
          );
        }
        return (
          <div>
            {upvotedPosts.length === 0 && upvotedComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">
                  No upvoted content
                </h2>
                <p className="text-sm sm:text-base text-gray-400 text-center max-w-md mb-6 px-4">
                  Posts and comments you upvote will appear here.
                </p>
              </div>
            ) : (
              <>
                {upvotedPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onDelete={() => fetchUserData()}
                    isSaved={savedPosts.some((sp) => sp._id === post._id)}
                  />
                ))}
                {upvotedComments.map((comment) => (
                  <UserCommentCard key={comment._id} comment={comment} />
                ))}
              </>
            )}
          </div>
        );

      case "downvoted":
        if (!isOwnProfile) {
          return (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Private</h2>
              <p className="text-sm sm:text-base text-gray-400 text-center max-w-md px-4">
                Only User can see his downvoted content.
              </p>
            </div>
          );
        }
        return (
          <div>
            {downvotedPosts.length === 0 && downvotedComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">
                  No downvoted content
                </h2>
                <p className="text-sm sm:text-base text-gray-400 text-center max-w-md mb-6 px-4">
                  Posts and comments you downvote will appear here.
                </p>
              </div>
            ) : (
              <>
                {downvotedPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onDelete={() => fetchUserData()}
                    isSaved={savedPosts.some((sp) => sp._id === post._id)}
                  />
                ))}
                {downvotedComments.map((comment) => (
                  <UserCommentCard key={comment._id} comment={comment} />
                ))}
              </>
            )}
          </div>
        );

      case "overview":
      default:
        return (
          <div>
            {/* Recent Posts */}
            {posts.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Recent Posts</h3>
                {posts.slice(0, 3).map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onDelete={() => fetchUserData()}
                    isSaved={savedPosts.some((sp) => sp._id === post._id)}
                  />
                ))}
              </div>
            )}

            {/* Recent Comments */}
            {comments.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Recent Comments</h3>
                {comments.slice(0, 3).map((comment) => (
                  <UserCommentCard key={comment._id} comment={comment} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {posts.length === 0 && comments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">No activity yet</h2>
                <p className="text-sm sm:text-base text-gray-400 text-center max-w-md mb-6 px-4">
                  {isOwnProfile
                    ? "Start posting and commenting to build your presence!"
                    : `${user?.username} hasn't been active yet.`}
                </p>
              </div>
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-white">
        <Navbar />
        <div className="pt-14 flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-white">
        <Navbar />
        <div className="pt-14 flex items-center justify-center h-screen px-4">
          <div className="text-center">
            <p className="text-red-500 text-base sm:text-xl mb-4">
              {error || "User not found"}
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-4 sm:px-6 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm sm:text-base"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-white transition-colors overflow-x-hidden">
      <Navbar />
      <div className="pt-14 flex min-w-0 w-full">
        <Sidebar setIsPopupOpen={setIsPopupOpen} />
        <div className="flex-1 flex justify-center min-w-0 overflow-x-hidden">
          {/* Main Content */}
          <main className="w-full max-w-3xl px-2 sm:px-4 min-w-0">
            {/* Profile Header */}
            <div className="relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mt-4 sm:mt-6 gap-3 w-full">
                <div className="flex items-end min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xl sm:text-2xl">
                      {user.username?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="ml-2 sm:ml-3 pb-0.5 sm:pb-1 min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl text-gray-900 dark:text-gray-100 font-bold truncate">
                      {user.username}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">
                      u/{user.username}
                    </p>
                  </div>
                </div>

                {/* Follow Button (only for other users) */}
                {!isOwnProfile && (
                  <button
                    onClick={() => isAuthenticated ? handleFollow() : navigate("/login")}
                    disabled={isFollowLoading}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-full font-medium transition ${
                      isFollowing
                        ? "bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-zinc-700"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    } disabled:opacity-50`}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4" />
                        <span>Unfollow</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Bio */}
              {user.bio && (
                <div className="mt-3 sm:mt-4 text-gray-700 dark:text-gray-300 text-sm sm:text-base break-words">
                  {user.bio}
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-1 sm:gap-0.5 mt-4 sm:mt-6 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base font-semibold rounded-full transition-colors whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab.toLowerCase()
                        ? "bg-gray-400 dark:bg-gray-600 text-white"
                        : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Content Filter */}
              {isOwnProfile && (
                <div className="flex items-center justify-between py-3 sm:py-4 border-b border-gray-300 dark:border-gray-800">
                  <button
                    onClick={() => navigate("/create")}
                    className="flex items-center gap-1 sm:gap-1 border border-gray-900 dark:border-white rounded-full py-1.5 px-3 sm:px-4 text-sm sm:text-base hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-150"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-semibold">Create Post</span>
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="mt-6 min-w-0 overflow-hidden">{renderContent()}</div>
            </div>
          </main>

          {/* Right Sidebar - Hidden on mobile/tablet, visible on large screens */}
          <aside className="hidden lg:block w-80 bg-white dark:bg-black border-gray-300 dark:border-gray-800 mt-6 ml-3">
            {/* Blue Header */}
            <div className="relative w-full bg-[#0045AC] rounded-t-3xl overflow-hidden">
              <div className="h-32 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div className="absolute bottom-5 left-3 text-white">
                  <h1 className="text-lg font-bold flex items-center gap-2">
                    {user.username}
                  </h1>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="ml-3 space-y-6 text-gray-900 dark:text-white">
              <div className="grid grid-cols-2 gap-3 text-left mt-4">
                <div>
                  <div className="text-sm font-bold">
                    {user.followers?.length || 0}
                  </div>
                  <div className="text-xs text-gray-400">Followers</div>
                </div>
                <div>
                  <div className="text-sm font-bold">{calculateKarma()}</div>
                  <div className="text-xs text-gray-400">Karma</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div>
                  <div className="text-sm font-bold">
                    {calculateRedditAge()}
                  </div>
                  <div className="text-xs text-gray-400">Reddit Age</div>
                </div>
                <div>
                  <div className="text-sm font-bold">{posts.length}</div>
                  <div className="text-xs text-gray-400">Posts</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>

            {/* Settings (only for own profile) */}
            {isOwnProfile && (
              <div className="py-3 border-t border-gray-300 dark:border-gray-800 mt-4 m-3">
                <h3 className="text-xs font-semibold text-gray-500 mb-4">
                  SETTINGS
                </h3>
                <div className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition cursor-pointer p-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.username?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Profile</div>
                      <div className="text-xs text-gray-400">
                        Customize your profile
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/SettingsProfile")}
                    className="px-4 py-1.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full text-sm transition"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Create Community Popup */}
      {isPopupOpen && (
        <CreateCommunityFlow onClose={() => setIsPopupOpen(false)} />
      )}
    </div>
  );
}
