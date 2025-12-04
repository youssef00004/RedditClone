import React, { useState, useEffect } from "react";
import {
  Home,
  BarChart3,
  Menu,
  Users,
  Settings,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { FaPlus } from "react-icons/fa6";
import communityService from "../services/communityService";

export default function Sidebar({ setIsPopupOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCommunitiesOpen, setIsCommunitiesOpen] = useState(false);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [loading, setLoading] = useState(false);

  const { isDarkMode } = useTheme();
  const { user } = useAuth();

  // Fetch user's joined communities
  useEffect(() => {
    if (user && isOpen && isCommunitiesOpen) {
      fetchJoinedCommunities();
    }
  }, [user, isOpen, isCommunitiesOpen]);

  const fetchJoinedCommunities = async () => {
    try {
      setLoading(true);
      const allCommunities = await communityService.getAllCommunities();

      // Filter communities where user is a member
      const joined = allCommunities.filter((community) =>
        community.members?.some(
          (member) =>
            (typeof member === "string" ? member : member._id) === user?.id
        )
      );

      setJoinedCommunities(joined);
    } catch (error) {
      console.error("Error fetching joined communities:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed ${
          isOpen ? "left-60" : "left-4"
        } top-20 p-2.5 bg-white dark:bg-zinc-950 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-full transition-all duration-300 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-700 z-50`}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-14 h-[calc(100vh-56px)] bg-white dark:bg-zinc-950 border-r border-gray-300 dark:border-zinc-800 transition-all duration-300 z-40 ${
          isOpen ? "w-60" : "w-0"
        } overflow-hidden`}
      >
        <div
          className={`w-60 h-full overflow-y-auto py-4 ${
            isOpen ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
        >
          {/* Main Navigation */}
          <nav className="px-3 space-y-1">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg transition"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </Link>

            <Link
              to="/all"
              className="flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg transition"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">All</span>
            </Link>

            <Link
              to="/communities"
              className="flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg transition"
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Communities</span>
            </Link>

            <button
              onClick={() => setIsPopupOpen(true)}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg transition"
            >
              <FaPlus className="w-5 h-5" />
              <span className="font-medium">Create Community</span>
            </button>
          </nav>

          {/* Communities Accordion */}
          <div className="px-3 mt-6">
            <div className="border-t border-gray-300 dark:border-zinc-800 pt-4">
              {/* COMMUNITIES ACCORDION HEADER */}
              <button
                onClick={() => setIsCommunitiesOpen(!isCommunitiesOpen)}
                className="flex w-full items-center justify-between py-3 group focus:outline-none"
              >
                <span className="text-xs font-bold tracking-widest text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200">
                  COMMUNITIES
                </span>

                {/* Chevron */}
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-transform duration-300 ${
                    isCommunitiesOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {/* ACCORDION CONTENT */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isCommunitiesOpen
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="pb-3 space-y-1">
                  {/* Manage Communities Button */}
                  <Link
                    to="/ManageCommunities"
                    className="flex items-center gap-3 w-full text-left px-2 py-2 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg group transition"
                  >
                    <Settings className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white transition-colors flex-shrink-0" />
                    <span className="text-sm font-medium">
                      Manage Communities
                    </span>
                  </Link>

                  {/* Loading State */}
                  {loading && (
                    <div className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                      Loading...
                    </div>
                  )}

                  {/* Joined Communities List */}
                  {!loading && joinedCommunities.length > 0 && (
                    <div className="mt-2">
                      {joinedCommunities.map((community) => (
                        <Link
                          key={community._id}
                          to={`/community/${community._id}`}
                          className="flex items-center gap-3 w-full text-left px-2 py-2 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg group transition"
                        >
                          {/* Community Icon */}
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                              {community.name.charAt(0).toUpperCase()}
                            </span>
                          </div>

                          {/* Community Name */}
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium truncate block">
                              r/{community.name}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* No Communities State */}
                  {!loading && joinedCommunities.length === 0 && (
                    <div className="px-2 py-3 text-sm text-gray-500 dark:text-gray-400">
                      No communities joined yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Spacer */}
      <div
        className={`${
          isOpen ? "w-60" : "w-0"
        } transition-all duration-300 flex-shrink-0`}
      ></div>
    </>
  );
}
