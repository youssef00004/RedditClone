import User from "../models/user.js";
import Community from "../models/community.js";

export const search = async (req, res) => {
  try {
    const query = req.query.q?.trim();

    if (!query) {
      return res.status(400).json({ message: "Search query required" });
    }

    // Case-insensitive regex search
    const regex = new RegExp(query, "i");

    const [users, communities] = await Promise.all([
      User.find({ username: regex }).select("username _id"),
      Community.find({ name: regex }).select("name _id description"),
    ]);

    res.json({
      users,
      communities,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
