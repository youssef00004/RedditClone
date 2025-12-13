import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Users, Search as SearchIcon, Loader2 } from "lucide-react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CreateCommunityFlow from "./CreateCommunityFlow";

export default function SearchPage(post) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const [activeTab, setActiveTab] = useState("all");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [results, setResults] = useState({ users: [], communities: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query) {
      performSearch(query, activeTab);
    }
  }, [query, activeTab]);

  const performSearch = async (searchQuery, type) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(
        `/search?q=${encodeURIComponent(searchQuery)}&type=${type}`
      );
      setResults(response.data.results);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to perform search. Please try again.");
      setResults({ users: [], communities: [] });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: "all",
      label: "All",
      count: (results.users?.length || 0) + (results.communities?.length || 0),
    },
    { id: "users", label: "Users", count: results.users?.length || 0 },
    {
      id: "communities",
      label: "Communities",
      count: results.communities?.length || 0,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />

      <div className="pt-14 flex">
        {/* Sidebar */}
        <Sidebar setIsPopupOpen={setIsPopupOpen} />
        <div className="max-w-4xl w-full mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Search Results
            </h1>
            {query && (
              <p className="text-gray-600 dark:text-gray-400">
                Showing results for:{" "}
                <span className="font-semibold">"{query}"</span>
              </p>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 mb-4">
            <div className="flex border-b border-gray-200 dark:border-zinc-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "text-orange-600 border-b-2 border-orange-600"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 dark:bg-zinc-800 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Results */}
          {!loading && !error && (
            <div className="space-y-4">
              {/* Users Section */}
              {(activeTab === "all" || activeTab === "users") &&
                results.users?.length > 0 && (
                  <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        Users
                      </h2>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-zinc-800">
                      {results.users.map((user) => (
                        <Link
                          key={user._id}
                          to={`/user/${user.username}`}
                          className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-900 transition"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-lg font-bold">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                u/{user.username}
                              </h3>
                              {user.bio && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                  {user.bio}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>
                                  {user.followers?.length || 0} followers
                                </span>
                                <span>•</span>
                                <span>
                                  {user.following?.length || 0} following
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

              {/* Communities Section */}
              {(activeTab === "all" || activeTab === "communities") &&
                results.communities?.length > 0 && (
                  <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        Communities
                      </h2>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-zinc-800">
                      {results.communities.map((community) => (
                        <Link
                          key={community._id}
                          to={`/community/${community._id}`}
                          className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-900 transition"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm font-bold">
                                {community?.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                r/{community.name}
                              </h3>
                              {community.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {community.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>
                                  {community.members?.length || 0} members
                                </span>
                                <span>•</span>
                                <span>
                                  Created by u/
                                  {community.creator?.username || "unknown"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

              {/* No Results */}
              {!loading &&
                results.users?.length === 0 &&
                results.communities?.length === 0 && (
                  <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 p-12 text-center">
                    <SearchIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No results found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Try different keywords or check your spelling
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
      {/* Create Community Popup */}
      {isPopupOpen && (
        <CreateCommunityFlow onClose={() => setIsPopupOpen(false)} />
      )}
    </div>
  );
}
