import React, { useState } from "react";
import { SiReddit } from "react-icons/si";
import {
  Search,
  Bell,
  Plus,
  FileText,
  LogOut,
  Settings,
  LogIn,
  Moon,
  Sun,
  EllipsisVertical,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 px-4 py-2 z-50 transition-colors">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
        {/* Logo with MyReddit */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <SiReddit className="w-7 h-7 text-orange-500" />
            <span className="text-gray-900 dark:text-white text-xl font-bold hidden sm:block">
              reddit
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-sm relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search Reddit"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 text-gray-900 dark:text-white placeholder-gray-400 pl-12 pr-4 py-2 rounded-full border border-orange-500 hover:border-transparent hover:border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 dark:hover:bg-zinc-700 dark:focus:ring-white transition"
            />
          </div>
        </div>

        {/* Right Side - Conditional based on authentication */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAuthenticated ? (
            <>
              {/* Authenticated User Buttons */}
              <Link
                to="/create"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-full transition"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Create</span>
              </Link>

              <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition">
                <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-orange-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  1
                </span>
              </button>

              {/* User Profile with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition ml-1"
                >
                  <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center relative">
                    {
                      <span className="text-white text-sm font-bold">
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                      </span>
                    }
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
                  </div>
                </button>

                {/* Dropdown Menu - Authenticated */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2.5 w-64 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-2xl overflow-hidden z-50">
                    {/* Profile Header */}
                    <Link
                      to={`/user/${user?.username}`}
                      className="block p-4 border-b border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer rounded transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg- bg-purple-400 rounded-full flex items-center justify-center relative">
                          {
                            <span className="text-white font-bold">
                              {user?.username?.charAt(0).toUpperCase() || "U"}
                            </span>
                          }
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-800 rounded-full"></span>
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
                    {/* Menu Items */}
                    <div className="py-2">
                      <button className="w-full px-4 py-3 text-left text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-700 flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <span>Drafts</span>
                      </button>

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
                    {/* Bottom Section */}
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
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-medium transition"
              >
                Log In
              </Link>

              {/* Three Dots Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition"
                >
                  <EllipsisVertical />
                </button>

                {/* Dropdown Menu for Not Authenticated Users */}
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
