// controllers/searchController.js
import User from "../models/user.js";
import Community from "../models/community.js";

// Search for users and communities
export const search = async (req, res) => {
  try {
    const { q, type = "all", limit = 10 } = req.query;

    // Validate search query
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchQuery = q.trim();
    const searchRegex = new RegExp(searchQuery, "i"); // Case-insensitive

    let results = {
      users: [],
      communities: [],
    };

    // Search users
    if (type === "all" || type === "users") {
      const users = await User.find({
        username: searchRegex,
      })
        .select("username bio followers following createdAt")
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      results.users = users;
    }

    // Search communities
    if (type === "all" || type === "communities") {
      const communities = await Community.find({
        $or: [{ name: searchRegex }, { description: searchRegex }],
      })
        .populate("creator", "username")
        .select("name description members creator createdAt")
        .limit(parseInt(limit))
        .sort({ members: -1 }); // Sort by member count

      results.communities = communities;
    }

    res.json({
      success: true,
      query: searchQuery,
      results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get search suggestions (for autocomplete)
export const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchQuery = q.trim();
    const searchRegex = new RegExp(`^${searchQuery}`, "i"); // Match start of string

    // Get top 5 users and communities
    const [users, communities] = await Promise.all([
      User.find({ username: searchRegex })
        .select("username")
        .limit(5)
        .sort({ followers: -1 }),
      Community.find({ name: searchRegex })
        .select("name members")
        .limit(5)
        .sort({ members: -1 }),
    ]);

    const suggestions = [
      ...users.map((u) => ({ type: "user", value: u.username, id: u._id })),
      ...communities.map((c) => ({
        type: "community",
        value: c.name,
        id: c._id,
      })),
    ];

    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
