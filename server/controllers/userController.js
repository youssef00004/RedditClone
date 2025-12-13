import User from "../models/user.js";
import Post from "../models/post.js";
import Comment from "../models/comment.js";
import bcrypt from "bcryptjs";
import { createNotification } from "./notificationController.js";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "username")
      .populate("following", "username");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get user by username
export const getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("-password")
      .populate("followers", "username")
      .populate("following", "username");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get user's posts
export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.id })
      .populate("author", "username")
      .populate("community", "name")
      .populate("comments")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get user's comments
export const getUserComments = async (req, res) => {
  try {
    const comments = await Comment.find({ author: req.params.id })
      .populate("author", "username")
      .populate("post", "title")
      .populate({
        path: "post",
        populate: [
          {
            path: "community",
            select: "name",
          },
          {
            path: "comments",
          },
        ],
      })
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get user's upvoted posts
export const getUserUpvotedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ upvotes: req.params.id })
      .populate("author", "username")
      .populate("community", "name")
      .populate("comments")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get user's downvoted posts
export const getUserDownvotedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ downvotes: req.params.id })
      .populate("author", "username")
      .populate("community", "name")
      .populate("comments")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get user's upvoted comments
export const getUserUpvotedComments = async (req, res) => {
  try {
    const comments = await Comment.find({ upvotes: req.params.id })
      .populate("author", "username")
      .populate("post", "title")
      .populate({
        path: "post",
        populate: [
          {
            path: "community",
            select: "name",
          },
          {
            path: "comments",
          },
        ],
      })
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get user's downvoted comments
export const getUserDownvotedComments = async (req, res) => {
  try {
    const comments = await Comment.find({ downvotes: req.params.id })
      .populate("author", "username")
      .populate("post", "title")
      .populate({
        path: "post",
        populate: [
          {
            path: "community",
            select: "name",
          },
          {
            path: "comments",
          },
        ],
      })
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get user's saved posts
export const getUserSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate({
      path: "savedPosts",
      populate: [
        { path: "author", select: "username" },
        { path: "community", select: "name" },
        { path: "comments" },
      ],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.savedPosts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Save a post
export const savePost = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { postId } = req.body;

    if (!user) return res.status(404).json({ message: "User not found" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check if already saved
    if (user.savedPosts.includes(postId)) {
      return res.status(400).json({ message: "Post already saved" });
    }

    user.savedPosts.push(postId);
    await user.save();

    res.json({
      message: "Post saved successfully",
      savedPosts: user.savedPosts,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Unsave a post
export const unsavePost = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { postId } = req.body;

    if (!user) return res.status(404).json({ message: "User not found" });

    user.savedPosts = user.savedPosts.filter((id) => id.toString() !== postId);
    await user.save();

    res.json({
      message: "Post unsaved successfully",
      savedPosts: user.savedPosts,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Follow a user
export const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow)
      return res.status(404).json({ message: "User not found" });

    // Can't follow yourself
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Check if already following
    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Add to following list
    currentUser.following.push(req.params.id);
    await currentUser.save();

    // Add to followers list
    userToFollow.followers.push(req.user.id);
    await userToFollow.save();

    // Create notification
    await createNotification(
      req.params.id,
      req.user.id,
      "follow",
      `u/${currentUser.username} started following you`
    );

    res.json({
      message: "Successfully followed user",
      following: currentUser.following,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow)
      return res.status(404).json({ message: "User not found" });

    // Remove from following list
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== req.params.id
    );
    await currentUser.save();

    // Remove from followers list
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== req.user.id
    );
    await userToUnfollow.save();

    res.json({
      message: "Successfully unfollowed user",
      following: currentUser.following,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    // Only the same user can update their profile
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const {
      username,
      email,
      bio,
      avatar,
      currentPassword,
      newPassword,
    } = req.body;

    // Find the user with password for verification
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {};

    // Update username
    if (username && username !== user.username) {
      // Check if username is already taken
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        return res.status(400).json({ message: "Username already taken" });
      }
      updateData.username = username;
    }

    // Update email
    if (email && email !== user.email) {
      // Prevent email update for Google users
      if (user.googleId) {
        return res.status(403).json({
          message: "Cannot update email for Google-authenticated accounts",
        });
      }

      // Verify current password for email change
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "Current password required to update email" });
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Check if email is already taken
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        return res.status(400).json({ message: "Email already in use" });
      }

      updateData.email = email;
    }

    // Update password
    if (newPassword) {
      // Prevent password update for Google users
      if (user.googleId) {
        return res.status(403).json({
          message: "Cannot update password for Google-authenticated accounts",
        });
      }

      // Verify current password
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "Current password required to update password" });
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Update bio and avatar if provided
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
