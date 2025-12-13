import React, { useState, useEffect, useRef } from "react";
import { SiReddit } from "react-icons/si";
import {
  Search,
  Bell,
  Plus,
  LogOut,
  Settings,
  LogIn,
  Moon,
  Sun,
  EllipsisVertical,
  MessageCircle,
  Users,
  Hash,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useChat } from "../context/ChatContext";
import api from "../services/api";
import notificationService from "../services/notificationService";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const { setIsChatOpen, unreadCount } = useChat();

  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    navigate("/login");
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If empty, clear results
    if (!value.trim()) {
      setSearchResults(null);
      setShowSearchDropdown(false);
      return;
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Perform the search
  const performSearch = async (query) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setShowSearchDropdown(true);

    try {
      const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data.results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults({ users: [], communities: [] });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search submit (Enter key)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchDropdown(false);
      setSearchQuery("");
    }
  };

  // Handle click result
  const handleResultClick = (type, value, id) => {
    if (type === "user") {
      navigate(`/user/${value}`);
    } else if (type === "community") {
      navigate(`/community/${id}`);
    }
    setSearchQuery("");
    setShowSearchDropdown(false);
    setSearchResults(null);
  };

  // Fetch notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (isAuthenticated) {
        try {
          const data = await notificationService.getUnreadCount();
          setNotificationCount(data.count || 0);
        } catch (error) {
          console.error("Error fetching notification count:", error);
        }
      }
    };

    fetchNotificationCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 px-2 sm:px-4 py-2 z-50 transition-colors">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Link to="/" className="flex items-center gap-1 sm:gap-2">
            <SiReddit className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500" />
            <span className="text-gray-900 dark:text-white text-lg sm:text-xl font-bold hidden sm:block">
              reddit
            </span>
          </Link>
        </div>

        {/* Search Bar with Dropdown */}
        <div className="flex-1 flex justify-center" ref={searchRef}>
          <div className="w-full max-w-sm relative">
            <form onSubmit={handleSearchSubmit}>
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchResults && setShowSearchDropdown(true)}
                className="w-full bg-white dark:bg-zinc-950 text-gray-900 dark:text-white placeholder-gray-400 pl-9 sm:pl-12 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-full border border-orange-500 hover:border-transparent hover:border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 dark:hover:bg-zinc-700 dark:focus:ring-white transition"
              />
            </form>

            {/* Search Results Dropdown */}
            {showSearchDropdown && searchResults && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    Searching...
                  </div>
                ) : (
                  <>
                    {/* Users Section */}
                    {searchResults.users && searchResults.users.length > 0 && (
                      <div className="border-b border-gray-200 dark:border-zinc-700">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          Users
                        </div>
                        {searchResults.users.map((user) => (
                          <button
                            key={user._id}
                            onClick={() =>
                              handleResultClick("user", user.username)
                            }
                            className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3 text-left transition"
                          >
                            <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm font-bold">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-gray-900 dark:text-white font-medium">
                                u/{user.username}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {user.followers?.length || 0} followers
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Communities Section */}
                    {searchResults.communities &&
                      searchResults.communities.length > 0 && (
                        <div>
                          <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                            Communities
                          </div>
                          {searchResults.communities.map((community) => (
                            <button
                              key={community._id}
                              onClick={() =>
                                handleResultClick(
                                  "community",
                                  community.name,
                                  community._id
                                )
                              }
                              className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3 text-left transition"
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
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {community.members?.length || 0} members
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                    {/* No Results */}
                    {searchResults.users?.length === 0 &&
                      searchResults.communities?.length === 0 && (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No results found for "{searchQuery}"
                        </div>
                      )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Conditional based on authentication */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {isAuthenticated ? (
            <>
              <Link
                to="/create"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-full transition"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-sm sm:text-base hidden md:inline">Create</span>
              </Link>

              <Link
                to="/Notification"
                className="relative p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition"
              >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 sm:top-1 sm:right-1 w-4 h-4 bg-orange-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsChatOpen(true)}
                className="relative p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition"
              >
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 sm:top-1 sm:right-1 w-4 h-4 bg-orange-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-1 sm:gap-2 p-0.5 sm:p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-400 rounded-full flex items-center justify-center relative">
                    <span className="text-white text-xs sm:text-sm font-bold">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2.5 w-64 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-2xl overflow-hidden z-50">
                    <Link
                      to={`/user/${user?.username}`}
                      className="block p-4 border-b border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer rounded transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center relative">
                          <span className="text-white font-bold">
                            {user?.username?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                        <div>
                          <div className="text-gray-900 dark:text-white font-normal">
                            View Profile
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs">
                            u/{user?.username || "User"}
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="py-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTheme();
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-zinc-700 flex items-center gap-3 justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {isDarkMode ? (
                            <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          )}
                          <span className="text-gray-900 dark:text-white">
                            {isDarkMode ? "Dark Mode" : "Light Mode"}
                          </span>
                        </div>
                        <div
                          className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative ${
                            isDarkMode ? "bg-blue-600" : "bg-gray-400"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                              isDarkMode ? "transform translate-x-6" : ""
                            }`}
                          >
                            {isDarkMode && (
                              <svg
                                className="w-5 h-5 text-blue-600"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-700 flex items-center gap-3"
                      >
                        <LogOut className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <span>Log Out</span>
                      </button>
                    </div>
                    <div className="py-2 border-t border-gray-200 dark:border-zinc-700">
                      <Link
                        to="/SettingsProfile"
                        className="w-full px-4 py-3 text-left text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-700 flex items-center gap-3"
                      >
                        <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <span>Settings</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base bg-orange-600 hover:bg-orange-700 text-white rounded-full font-medium transition"
              >
                Log In
              </Link>

              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition"
                >
                  <EllipsisVertical className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-2xl overflow-hidden z-50">
                    <div className="py-2">
                      <Link
                        to="/login"
                        className="w-full px-4 py-3 text-left text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-700 flex items-center gap-3"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <LogIn className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <span>Log In / Sign Up</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
