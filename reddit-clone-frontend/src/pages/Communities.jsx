import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import communityService from "../services/communityService";
import CreateCommunityFlow from "./CreateCommunityFlow";

const AllCommunities = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const data = await communityService.getAllCommunities();
      // Sort by member count (descending)
      const sorted = data.sort(
        (a, b) => (b.members?.length || 0) - (a.members?.length || 0)
      );
      setCommunities(sorted);
      setError("");
    } catch (err) {
      setError(err.toString() || "Failed to load communities");
      console.error("Error fetching communities:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCommunities = communities.filter(
    (community) =>
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatMemberCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-white">
      <Navbar />

      <div className="pt-14 flex">
        <div className="flex-1">
          <main className="max-w-[1400px] mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between border-b border-gray-300 dark:border-zinc-800 pb-4">
                <h2 className="text-2xl font-bold">Reddit Communities</h2>
              </div>

              {/* Search Bar */}
              <div className="mt-6 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search communities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
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

            {/* Communities Grid */}
            {!loading && !error && (
              <>
                {filteredCommunities.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold mb-2">
                      {searchQuery
                        ? "No communities found"
                        : "No communities yet"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {searchQuery
                        ? "Try adjusting your search"
                        : "Be the first to create a community!"}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={() => setIsPopupOpen(true)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition"
                      >
                        Create Community
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6">
                    {filteredCommunities.map((comm, index) => (
                      <div
                        key={comm._id}
                        onClick={() => navigate(`/community/${comm._id}`)}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer group border border-transparent hover:border-gray-300 dark:hover:border-zinc-700"
                      >
                        {/* Rank */}
                        <span className="text-gray-900 dark:text-gray-100 font-bold w-6 text-right mt-1 text-sm">
                          {index + 1}
                        </span>

                        {/* Community Icon */}
                        <div
                          className={`w-10 h-10 min-w-[40px] bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl overflow-hidden`}
                        >
                          {comm.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Text Info */}
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center justify-between w-full">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate pr-2">
                              r/{comm.name}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">
                            {comm.description || "No description"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {formatMemberCount(comm.members?.length || 0)}{" "}
                            members
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Create Community Modal */}
      {isPopupOpen && (
        <CreateCommunityFlow
          onClose={() => {
            setIsPopupOpen(false);
            fetchCommunities(); // Refresh after creating
          }}
        />
      )}
    </div>
  );
};

export default AllCommunities;
