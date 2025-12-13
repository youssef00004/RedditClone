import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find user by email OR username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        googleId: user.googleId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    console.log("Starting Google login verification...");

    // Verify Google token with timeout handling
    let ticket;
    try {
      ticket = await Promise.race([
        client.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Google verification timeout")), 10000)
        )
      ]);
    } catch (verifyError) {
      console.error("Google token verification failed:", verifyError);
      throw new Error("Failed to verify Google token. Please try again.");
    }

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    console.log("Google verification successful, checking user...");

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      console.log("Creating new user for Google login...");

      // Hash the googleId as password (only once)
      const hashedPassword = await bcrypt.hash(googleId, 8); // Reduced cost factor from 10 to 8 for faster hashing

      // Create new user if doesn't exist
      user = new User({
        username:
          name.replace(/\s+/g, "_").toLowerCase() + "_" + googleId.slice(0, 5),
        email,
        password: hashedPassword,
        googleId: googleId,
        avatar: picture,
        bio: "Signed up with Google",
      });

      await user.save();
      console.log("New user created successfully");
    } else if (!user.googleId) {
      console.log("Updating existing user with Google ID...");
      // Update existing user with googleId if they don't have it
      user.googleId = googleId;
      await user.save();
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log("Google login completed successfully");

    res.json({
      message: "Google login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        googleId: user.googleId,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res
      .status(500)
      .json({ message: "Google authentication failed", error: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error });
  }
};
