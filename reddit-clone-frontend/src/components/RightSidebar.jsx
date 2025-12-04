import React from "react";

export default function RightSidebar() {
  const recentPosts = [
    {
      id: 1,
      subreddit: "changelog",
      title: "Log in or sign up with your Google or Apple accounts",
      timeAgo: "5y ago",
      upvotes: 89,
      comments: 88,
    },
  ];

  return (
    <aside className="w-80 p-4 space-y-4">
      {/* Recent Posts */}
      <div className="bg-gray-200 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg p-4 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">
            Recent Posts
          </h3>
          <button className="text-blue-500 text-sm font-medium hover:underline">
            Clear
          </button>
        </div>

        <div className="space-y-3">
          {recentPosts.map((post) => (
            <div
              key={post.id}
              className="flex gap-3 p-3 hover:bg-gray-300 dark:hover:bg-zinc-700 rounded-lg cursor-pointer transition-colors"
            >
              <div className="w-10 h-10 bg-orange-600 rounded flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold">r</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  r/{post.subreddit} • {post.timeAgo}
                </div>
                <h4 className="text-gray-900 dark:text-white text-sm font-medium mb-2 line-clamp-2">
                  {post.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span>{post.upvotes} upvotes</span>
                  <span>•</span>
                  <span>{post.comments} comments</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Links */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2 px-2">
        <div className="flex flex-wrap gap-2">
          <a href="#" className="hover:underline">
            Reddit Rules
          </a>
          <span>•</span>
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <span>•</span>
          <a href="#" className="hover:underline">
            User Agreement
          </a>
        </div>
        <div>
          <a href="#" className="hover:underline">
            Accessibility
          </a>
        </div>
        <div className="pt-2">Reddit, Inc. © 2025. All rights reserved.</div>
      </div>
    </aside>
  );
}
