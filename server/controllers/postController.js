import Post from "../models/post.js";
import Community from "../models/community.js";
import User from "../models/user.js";
import cloudinary from "../config/cloudinary.js";

// Helper function to upload to Cloudinary
const uploadToCloudinary = (fileBuffer, folder = "reddit-posts") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "auto",
        timeout: 120000 // 2 minutes timeout for large files
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { title, content, communityId, type, link } = req.body;

    const community = await Community.findById(communityId);
    if (!community)
      return res.status(404).json({ message: "Community not found" });

    // Check if user is a member
    if (!community.members.includes(req.user.id)) {
      return res
        .status(403)
        .json({ message: "You must join the community first" });
    }

    // Prepare post data
    const postData = {
      title,
      content: content || "",
      type: type || "text",
      community: communityId,
      author: req.user.id,
    };

    // Handle image/video upload
    if ((type === "image" || type === "video") && req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      postData.image = result.secure_url;
    }

    // Handle link post
    if (type === "link" && link) {
      postData.link = link;
    }

    const newPost = new Post(postData);
    await newPost.save();

    // Populate author and community details
    await newPost.populate("author", "username avatar");
    await newPost.populate("community", "name");
    await newPost.populate("comments");

    res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get posts of a specific community
export const getCommunityPosts = async (req, res) => {
  try {
    const posts = await Post.find({ community: req.params.communityId })
      .populate("author", "username avatar")
      .populate("community", "name")
      .populate("comments")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get posts for user's feed (joined communities only)
export const getFeedPosts = async (req, res) => {
  try {
    const communities = await Community.find({ members: req.user.id }).select(
      "_id"
    );
    const communityIds = communities.map((c) => c._id);

    const posts = await Post.find({ community: { $in: communityIds } })
      .populate("author", "username avatar")
      .populate("community", "name")
      .populate("comments")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get ALL posts from all communities
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username avatar")
      .populate("community", "name")
      .populate("comments")
      .sort({ createdAt: -1 })
      .limit(100); // Limit to prevent overwhelming responses

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get posts from followed users and joined communities
export const getFollowingFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get communities user is a member of
    const communities = await Community.find({ members: req.user.id }).select(
      "_id"
    );
    const communityIds = communities.map((c) => c._id);

    // If user has no following and no communities, return empty array
    if ((!user.following || user.following.length === 0) && communityIds.length === 0) {
      return res.json([]);
    }

    // Build query conditions
    const queryConditions = [];
    if (user.following && user.following.length > 0) {
      queryConditions.push({ author: { $in: user.following } });
    }
    if (communityIds.length > 0) {
      queryConditions.push({ community: { $in: communityIds } });
    }

    // Get posts from followed users OR joined communities
    const posts = await Post.find({
      $or: queryConditions,
    })
      .populate("author", "username avatar")
      .populate("community", "name")
      .populate("comments")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error("Get following feed error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single post by ID
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username avatar")
      .populate("community", "name")
      .populate("comments");
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own posts" });
    }

    // Delete image from Cloudinary if exists
    if (post.image) {
      const publicId = post.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`reddit-posts/${publicId}`);
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
