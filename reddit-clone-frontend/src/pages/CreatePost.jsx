import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { ChevronDown, Upload, X, Search } from "lucide-react";
import communityService from "../services/communityService";
import postService from "../services/postService";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function CreatePost() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState("text");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [showCommunitySearch, setShowCommunitySearch] = useState(false);
  const [communitySearch, setCommunitySearch] = useState("");
  const [communities, setCommunities] = useState([]);
  const [filteredCommunities, setFilteredCommunities] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Fetch communities on mount - only show joined communities
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const data = await communityService.getAllCommunities();
        // Filter to only show communities where the user is a member
        const userId = user?._id || user?.id;
        const joinedCommunities = data.filter((community) =>
          community.members?.some(
            (memberId) => String(memberId) === String(userId)
          )
        );
        setCommunities(joinedCommunities);
        setFilteredCommunities(joinedCommunities);
      } catch (err) {
        console.error("Error fetching communities:", err);
      }
    };
    if (user) {
      fetchCommunities();
    }
  }, [user]);

  // Filter communities based on search
  useEffect(() => {
    if (communitySearch) {
      const filtered = communities.filter((community) =>
        community.name.toLowerCase().includes(communitySearch.toLowerCase())
      );
      setFilteredCommunities(filtered);
    } else {
      setFilteredCommunities(communities);
    }
  }, [communitySearch, communities]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size should be less than 10MB");
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handlePost = async () => {
    setError("");

    if (!title.trim()) {
      setError("Please add a title");
      return;
    }

    if (!selectedCommunity) {
      setError("Please select a community");
      return;
    }

    if (activeTab === "images" && !selectedImage) {
      setError("Please select an image");
      return;
    }

    if (activeTab === "link" && !linkUrl.trim()) {
      setError("Please add a URL");
      return;
    }

    setLoading(true);

    try {
      let result;

      if (activeTab === "text") {
        result = await postService.createTextPost(
          title,
          body,
          selectedCommunity._id
        );
      } else if (activeTab === "images") {
        result = await postService.createImagePost(
          title,
          selectedImage,
          selectedCommunity._id
        );
      } else if (activeTab === "link") {
        result = await postService.createLinkPost(
          title,
          linkUrl,
          selectedCommunity._id
        );
      }

      console.log("Post created:", result);
      navigate("/");
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      <Navbar />

      <div className="pt-14 flex">
        <Sidebar setIsPopupOpen={setIsPopupOpen} />

        <div className="flex-1 flex justify-center">
          <main className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h1 className="text-gray-900 dark:text-white text-2xl sm:text-3xl font-medium">
                Create post
              </h1>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500 bg-opacity-10 dark:bg-red-500 dark:bg-opacity-20 border border-red-500 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Select Community */}
            {!showCommunitySearch && !selectedCommunity ? (
              <button
                onClick={() => setShowCommunitySearch(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-full mb-6 transition"
              >
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">r/</span>
                </div>
                <span className="font-medium text-sm sm:text-base">
                  {communities.length === 0
                    ? "Join a community to post"
                    : "Select a community"}
                </span>
                <ChevronDown className="w-4 h-4 ml-auto sm:ml-2" />
              </button>
            ) : selectedCommunity ? (
              <button
                onClick={() => {
                  setSelectedCommunity(null);
                  setShowCommunitySearch(true);
                }}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-full mb-6 transition"
              >
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {selectedCommunity.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-medium text-sm sm:text-base truncate">
                  r/{selectedCommunity.name}
                </span>
                <X className="w-4 h-4 ml-auto sm:ml-2" />
              </button>
            ) : (
              <div className="mb-6 relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder={
                      communities.length === 0
                        ? "Join a community to post"
                        : "Select a community"
                    }
                    value={communitySearch}
                    onChange={(e) => setCommunitySearch(e.target.value)}
                    autoFocus
                    disabled={communities.length === 0}
                    className="w-full sm:w-8/12 md:w-6/12 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pl-12 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Community Dropdown */}
                {filteredCommunities.length > 0 && (
                  <div className="absolute top-full mt-2 w-full sm:w-8/12 md:w-6/12 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-2xl max-h-64 overflow-y-auto z-10">
                    {filteredCommunities.map((community) => (
                      <button
                        key={community._id}
                        onClick={() => {
                          setSelectedCommunity(community);
                          setShowCommunitySearch(false);
                          setCommunitySearch("");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-zinc-700 transition text-left"
                      >
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">
                            {community.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-gray-900 dark:text-white font-medium">
                            r/{community.name}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 text-sm truncate">
                            {community.members?.length || 0} members
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {/* Show message when no communities found during search */}
                {communities.length > 0 &&
                  filteredCommunities.length === 0 &&
                  communitySearch && (
                    <div className="absolute top-full mt-2 w-full sm:w-8/12 md:w-6/12 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-2xl p-4 z-10">
                      <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
                        No joined communities match your search
                      </p>
                    </div>
                  )}
              </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-3 sm:gap-6 mb-6 border-b border-gray-300 dark:border-zinc-800 overflow-x-auto">
              <button
                onClick={() => setActiveTab("text")}
                className={`pb-3 px-1 font-medium text-xs sm:text-sm transition relative whitespace-nowrap ${
                  activeTab === "text"
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Text
                {activeTab === "text" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 dark:bg-blue-400"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("images")}
                className={`pb-3 px-1 font-medium text-xs sm:text-sm transition relative whitespace-nowrap ${
                  activeTab === "images"
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Images & Video
                {activeTab === "images" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 dark:bg-blue-400"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("link")}
                className={`pb-3 px-1 font-medium text-xs sm:text-sm transition relative whitespace-nowrap ${
                  activeTab === "link"
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Link
                {activeTab === "link" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 dark:bg-blue-400"></div>
                )}
              </button>
            </div>

            {/* Content Area */}
            <div className="space-y-4">
              {/* Title Input */}
              <div>
                <input
                  type="text"
                  placeholder="Title*"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={300}
                  disabled={loading}
                  className="w-full bg-white dark:bg-black border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:opacity-50"
                />
                <div className="text-right text-gray-500 dark:text-gray-400 text-xs mt-2">
                  {title.length}/300
                </div>
              </div>

              {/* Text Tab */}
              {activeTab === "text" && (
                <div className="bg-white dark:bg-black border border-gray-300 dark:border-zinc-800 rounded-lg overflow-hidden">
                  {/* Text Area */}
                  <textarea
                    placeholder="Body text (optional)"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={10}
                    disabled={loading}
                    className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 focus:outline-none resize-none disabled:opacity-50"
                  />
                </div>
              )}

              {/* Images & Video Tab */}
              {activeTab === "images" && (
                <div>
                  {!imagePreview ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        id="media-upload"
                        onChange={handleImageSelect}
                        disabled={loading}
                      />
                      <label
                        htmlFor="media-upload"
                        className="block border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-8 sm:p-16 text-center hover:border-gray-400 dark:hover:border-zinc-600 transition cursor-pointer"
                      >
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                            <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                          </div>
                          <div>
                            <p className="text-gray-900 dark:text-white text-sm sm:text-base mb-1">
                              Drag and Drop or upload media
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                              Max file size: 10MB
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-auto max-h-96 object-contain rounded-lg bg-white dark:bg-black"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full transition"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Link Tab */}
              {activeTab === "link" && (
                <div>
                  <input
                    type="url"
                    placeholder="Link URL *"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    disabled={loading}
                    className="w-full bg-white dark:bg-black border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 sm:gap-3 pt-4">
                <button
                  onClick={handlePost}
                  disabled={!title.trim() || !selectedCommunity || loading}
                  className={`px-4 sm:px-6 py-2 rounded-full font-medium text-sm sm:text-base transition ${
                    title.trim() && selectedCommunity && !loading
                      ? "bg-blue-600 hover:bg-blue-700 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black"
                      : "bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {loading ? "Posting..." : "Post"}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 sm:mt-12 pt-6 border-t border-gray-200 dark:border-zinc-900">
              <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-gray-500 dark:text-gray-400">
                <a
                  href="#"
                  className="hover:underline hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Reddit Rules
                </a>
                <a
                  href="#"
                  className="hover:underline hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="hover:underline hover:text-gray-700 dark:hover:text-gray-300"
                >
                  User Agreement
                </a>
                <a
                  href="#"
                  className="hover:underline hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Accessibility
                </a>
                <span className="hidden sm:inline">•</span>
                <span className="w-full sm:w-auto">
                  Reddit, Inc. © 2025. All rights reserved.
                </span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
