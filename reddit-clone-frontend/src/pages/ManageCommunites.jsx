import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Star,
  Shield,
  Loader2,
  UserMinus,
  UserCheck,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import communityService from "../services/communityService";
import { useAuth } from "../context/AuthContext";
import CreateCommunityFlow from "./CreateCommunityFlow";
import ConfirmModal from "../components/ConfirmModal";

const ManageCommunities = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("All Communities");
  const [communities, setCommunities] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [communityToLeave, setCommunityToLeave] = useState(null);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserCommunities();
      loadFavorites();
    }
  }, [user]);

  const fetchUserCommunities = async () => {
    try {
      setLoading(true);
      const allCommunities = await communityService.getAllCommunities();

      // Filter communities where user is a member
      const joinedCommunities = allCommunities.filter((community) =>
        community.members?.some(
          (member) =>
            (typeof member === "string" ? member : member._id) === user?.id
        )
      );

      setCommunities(joinedCommunities);
      setError("");
    } catch (err) {
      setError(err.toString() || "Failed to load communities");
      console.error("Error fetching communities:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem(`favorites_${user?.id}`);
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  const saveFavorites = (newFavorites) => {
    localStorage.setItem(`favorites_${user?.id}`, JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const toggleFavorite = (communityId) => {
    const isFavorite = favorites.includes(communityId);
    let newFavorites;

    if (isFavorite) {
      newFavorites = favorites.filter((id) => id !== communityId);
    } else {
      newFavorites = [...favorites, communityId];
    }

    saveFavorites(newFavorites);
  };

  const handleLeave = (communityId, communityName) => {
    setCommunityToLeave({ id: communityId, name: communityName });
    setIsModalOpen(true);
  };

  const confirmLeave = async () => {
    if (!communityToLeave) return;

    setIsLeaving(true);
    try {
      await communityService.leaveCommunity(communityToLeave.id);
      // Remove from local state
      setCommunities(communities.filter((c) => c._id !== communityToLeave.id));
      // Remove from favorites if it's there
      if (favorites.includes(communityToLeave.id)) {
        saveFavorites(favorites.filter((id) => id !== communityToLeave.id));
      }
      setIsModalOpen(false);
      setCommunityToLeave(null);
    } catch (err) {
      setError(err.toString() || "Failed to leave community");
      setIsModalOpen(false);
      setCommunityToLeave(null);
    } finally {
      setIsLeaving(false);
    }
  };

  const filteredCommunities = communities.filter(
    (community) =>
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteCommunities = filteredCommunities.filter((c) =>
    favorites.includes(c._id)
  );

  const displayedCommunities =
    activeTab === "Favorites" ? favoriteCommunities : filteredCommunities;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-white">
      <Navbar />

      <div className="pt-14 flex">
        <Sidebar setIsPopupOpen={setIsPopupOpen} />

        <div className="flex-1">
          <main className="max-w-[1200px] mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column (Content) */}
            <div className="md:col-span-8">
              <h1 className="text-3xl font-bold mb-3 text-black dark:text-white">
                Manage communities
              </h1>

              {/* Filter Input */}
              <div className="relative mb-6">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Filter your communities"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-black border border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-600 rounded-lg py-2 pl-10 pr-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {/* Communities List */}
              {!loading && !error && (
                <>
                  {displayedCommunities.length === 0 ? (
                    <div className="text-center py-12 bg-gray-100 dark:bg-zinc-900 rounded-lg border border-gray-300 dark:border-zinc-800">
                      <h3 className="text-xl font-semibold mb-2">
                        {searchQuery
                          ? "No communities found"
                          : activeTab === "Favorites"
                          ? "No favorite communities yet"
                          : "You haven't joined any communities"}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {searchQuery
                          ? "Try adjusting your search"
                          : activeTab === "Favorites"
                          ? "Star your favorite communities to see them here"
                          : "Browse and join communities to get started!"}
                      </p>
                      {!searchQuery && activeTab !== "Favorites" && (
                        <button
                          onClick={() => navigate("/communities")}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition"
                        >
                          Browse Communities
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {displayedCommunities.map((community) => (
                        <CommunityItem
                          key={community._id}
                          community={community}
                          isFavorite={favorites.includes(community._id)}
                          onToggleFavorite={() => toggleFavorite(community._id)}
                          onLeave={() =>
                            handleLeave(community._id, community.name)
                          }
                          onNavigate={() =>
                            navigate(`/community/${community._id}`)
                          }
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right Column (Sidebar) */}
            <div className="hidden md:block md:col-span-4 pl-4 pt-10">
              <div className="p-2">
                <button
                  onClick={() => setActiveTab("All Communities")}
                  className={`w-full text-left px-3 py-2 rounded transition ${
                    activeTab === "All Communities"
                      ? "bg-gray-400 text-white dark:bg-zinc-600"
                      : "hover:bg-gray-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  All Communities
                </button>
                <button
                  onClick={() => setActiveTab("Favorites")}
                  className={`w-full text-left px-3 py-2 rounded transition ${
                    activeTab === "Favorites"
                      ? "bg-gray-400 text-white dark:bg-zinc-600"
                      : "hover:bg-gray-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  Favorites
                </button>
              </div>

              {/* Footer */}
              <div className="mt-auto pt-20 text-xs text-gray-500 space-y-2  border-gray-300 dark:border-zinc-800">
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                  <a href="#" className="hover:underline">
                    Reddit Rules
                  </a>
                  <a href="#" className="hover:underline">
                    Privacy Policy
                  </a>
                  <a href="#" className="hover:underline">
                    User Agreement
                  </a>
                </div>
                <div>
                  <a href="#" className="hover:underline">
                    Accessibility
                  </a>
                </div>
                <p>Reddit, Inc. © 2025. All rights reserved.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
      {/* Create Community Popup */}
      {isPopupOpen && (
        <CreateCommunityFlow onClose={() => setIsPopupOpen(false)} />
      )}

      {/* Leave Community Confirmation Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCommunityToLeave(null);
        }}
        onConfirm={confirmLeave}
        title="Leave community"
        message={`Are you sure you want to leave r/${communityToLeave?.name}? You can always rejoin later.`}
        confirmText="Leave"
        cancelText="Cancel"
        isLoading={isLeaving}
      />
    </div>
  );
};

// Sub-component for a single community item
const CommunityItem = ({
  community,
  isFavorite,
  onToggleFavorite,
  onLeave,
  onNavigate,
}) => {
  return (
    <div
      onClick={onNavigate}
      className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg group transition-colors cursor-pointer border border-transparent hover:border-gray-300 dark:hover:border-zinc-700"
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center relative">
          <span className="text-lg font-bold text-white">
            {community.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Text */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">r/{community.name}</span>
          </div>
          <span className="text-xs text-gray-500 truncate max-w-xs">
            {community.description || "No description"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`p-1 transition-colors ${
            isFavorite
              ? "text-yellow-500 hover:text-yellow-600"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
        >
          <Star size={20} fill={isFavorite ? "currentColor" : "none"} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLeave();
          }}
          className="flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-bold transition-colors border border-gray-300 dark:border-zinc-600 hover:border-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <UserMinus size={16} />
          <span>Leave</span>
        </button>
      </div>
    </div>
  );
};

export default ManageCommunities;
