import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  ChevronDown,
  Bold,
  Italic,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  ListOrdered,
  Code,
  Table,
  MoreHorizontal,
  Upload,
  X,
} from "lucide-react";
import communityService from "../services/communityService";
import postService from "../services/postService";

export default function CreatePost() {
  const navigate = useNavigate();
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

  // Fetch communities on mount
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const data = await communityService.getAllCommunities();
        setCommunities(data);
        setFilteredCommunities(data);
      } catch (err) {
        console.error("Error fetching communities:", err);
      }
    };
    fetchCommunities();
  }, []);

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

  const handleSaveDraft = () => {
    console.log("Saving draft:", { title, body });
    // Implement draft saving functionality
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="pt-14 flex">
        <Sidebar setIsPopupOpen={setIsPopupOpen} />

        <div className="flex-1 flex justify-center">
          <main className="w-full max-w-4xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-white text-3xl font-medium">Create post</h1>
              <button className="text-gray-400 hover:text-white text-sm font-medium">
                Drafts
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Select Community */}
            {!showCommunitySearch && !selectedCommunity ? (
              <button
                onClick={() => setShowCommunitySearch(true)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full mb-6 transition"
              >
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                  </svg>
                </div>
                <span className="font-medium">Select a community</span>
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
            ) : selectedCommunity ? (
              <button
                onClick={() => {
                  setSelectedCommunity(null);
                  setShowCommunitySearch(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full mb-6 transition"
              >
                <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">r</span>
                </div>
                <span className="font-medium">r/{selectedCommunity.name}</span>
                <X className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <div className="mb-6 relative">
                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Select a community"
                    value={communitySearch}
                    onChange={(e) => setCommunitySearch(e.target.value)}
                    autoFocus
                    className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400 pl-12 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Community Dropdown */}
                {filteredCommunities.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl max-h-64 overflow-y-auto z-10">
                    {filteredCommunities.map((community) => (
                      <button
                        key={community._id}
                        onClick={() => {
                          setSelectedCommunity(community);
                          setShowCommunitySearch(false);
                          setCommunitySearch("");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition text-left"
                      >
                        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">
                            r
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium">
                            r/{community.name}
                          </div>
                          <div className="text-gray-400 text-sm truncate">
                            {community.members?.length || 0} members
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-6 mb-6 border-b border-zinc-800">
              <button
                onClick={() => setActiveTab("text")}
                className={`pb-3 px-1 font-medium text-sm transition relative ${
                  activeTab === "text"
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                Text
                {activeTab === "text" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("images")}
                className={`pb-3 px-1 font-medium text-sm transition relative ${
                  activeTab === "images"
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                Images & Video
                {activeTab === "images" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("link")}
                className={`pb-3 px-1 font-medium text-sm transition relative ${
                  activeTab === "link"
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                Link
                {activeTab === "link" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
                )}
              </button>
              <button
                disabled
                className="pb-3 px-1 font-medium text-sm text-gray-600 cursor-not-allowed"
              >
                Poll
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
                  className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-gray-500 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                />
                <div className="text-right text-gray-500 text-xs mt-2">
                  {title.length}/300
                </div>
              </div>

              {/* Add Tags */}
              <button className="text-gray-500 text-sm hover:text-gray-400">
                Add tags
              </button>

              {/* Text Tab */}
              {activeTab === "text" && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                  {/* Toolbar */}
                  <div className="flex items-center gap-1 p-2 border-b border-zinc-800 flex-wrap">
                    <button className="p-2 hover:bg-zinc-800 rounded text-gray-400 hover:text-white transition">
                      <Bold className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-zinc-800 rounded text-gray-400 hover:text-white transition">
                      <Italic className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-zinc-800 rounded text-gray-400 hover:text-white transition">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="4" y1="12" x2="20" y2="12" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-zinc-800 rounded text-gray-400 hover:text-white transition">
                      <span className="text-sm font-bold">X²</span>
                    </button>
                    <button className="p-2 hover:bg-zinc-800 rounded text-gray-400 hover:text-white transition">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4 7h16M4 12h16M4 17h16" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-zinc-800 rounded text-gray-400 hover:text-white transition">
                      <LinkIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-zinc-800 rounded text-gray-400 hover:text-white transition">
                      <ImageIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-zinc-800 rounded text-gray-400 hover:text-white transition">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-zinc-800 rounded text-gray-400 hover:text-white transition">
                      <List className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-zinc-800 rounded text-gray-400 hover:text-white transition">
                      <ListOrdered className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-zinc-800 rounded text-gray-400 hover:text-white transition">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 10h1v4H9zM14 10h1v4h-1z" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-zinc-800 rounded text-gray-400 hover:text-white transition">
                      <span className="text-xs font-mono">99</span>
                    </button>
                    <button className="p-2 hover:bg-zinc-800 rounded text-gray-400 hover:text-white transition">
                      <Code className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-zinc-800 rounded text-gray-400 hover:text-white transition">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-zinc-800 rounded text-gray-400 hover:text-white transition">
                      <Table className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-zinc-800 rounded text-gray-400 hover:text-white transition ml-auto">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Text Area */}
                  <textarea
                    placeholder="Body text (optional)"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={10}
                    disabled={loading}
                    className="w-full bg-transparent text-white placeholder-gray-500 px-4 py-3 focus:outline-none resize-none disabled:opacity-50"
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
                        className="block border-2 border-dashed border-zinc-700 rounded-lg p-16 text-center hover:border-zinc-600 transition cursor-pointer"
                      >
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
                            <Upload className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-white text-base mb-1">
                              Drag and Drop or upload media
                            </p>
                            <p className="text-gray-500 text-sm">
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
                        className="w-full h-auto max-h-96 object-contain rounded-lg bg-zinc-900"
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
                    className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-gray-500 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-gray-400 rounded-full font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Draft
                </button>
                <button
                  onClick={handlePost}
                  disabled={!title.trim() || !selectedCommunity || loading}
                  className={`px-6 py-2 rounded-full font-medium transition ${
                    title.trim() && selectedCommunity && !loading
                      ? "bg-white hover:bg-gray-100 text-black"
                      : "bg-zinc-800 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {loading ? "Posting..." : "Post"}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-zinc-900">
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <a href="#" className="hover:underline">
                  Reddit Rules
                </a>
                <a href="#" className="hover:underline">
                  Privacy Policy
                </a>
                <a href="#" className="hover:underline">
                  User Agreement
                </a>
                <a href="#" className="hover:underline">
                  Accessibility
                </a>
                <span>•</span>
                <span>Reddit, Inc. © 2025. All rights reserved.</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
