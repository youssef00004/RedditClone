import Community from "../models/community.js";
import User from "../models/user.js";

// Create new community
export const createCommunity = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if name already exists
    const existing = await Community.findOne({ name });
    if (existing)
      return res.status(400).json({ message: "Community name already taken" });

    const newCommunity = new Community({
      name,
      description,
      creator: req.user.id,
      members: [req.user.id],
    });

    await newCommunity.save();

    res.status(201).json({
      message: "Community created successfully",
      community: newCommunity,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Join community
export const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community)
      return res.status(404).json({ message: "Community not found" });

    if (community.members.includes(req.user.id)) {
      return res.status(400).json({ message: "Already a member" });
    }

    community.members.push(req.user.id);
    await community.save();

    res.json({ message: "Joined community successfully", community });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Leave community
export const leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community)
      return res.status(404).json({ message: "Community not found" });

    // Check if user is a member
    if (!community.members.includes(req.user.id)) {
      return res.status(400).json({ message: "Not a member of this community" });
    }

    // Remove user from members (creators can leave too)
    community.members = community.members.filter(
      (memberId) => memberId.toString() !== req.user.id
    );
    await community.save();

    res.json({ message: "Left community successfully", community });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// View community details
export const getCommunityDetails = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate("creator", "username email")
      .populate("members", "username");

    if (!community)
      return res.status(404).json({ message: "Community not found" });

    res.json(community);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// View all communities
export const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .select("name description members createdAt")
      .populate("creator", "username")
      .sort({ createdAt: -1 }); // Most recent first

    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
