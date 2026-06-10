import express from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import protect from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { escapeRegex, handleServerError, normalizeSearchQuery } from "../utils/requestUtils.js";

const router = express.Router();
const PUBLIC_USER_FIELDS = "username profilePicture bio followers following createdAt";
const MAX_USERNAME_LENGTH = 30;
const MAX_BIO_LENGTH = 160;

// GET /api/users/search?q=
router.get("/search", protect, async (req, res) => {
  try {
    const q = normalizeSearchQuery(req.query.q);
    if (!q) return res.json([]);

    const users = await User.find({ username: { $regex: escapeRegex(q), $options: "i" } })
      .select("username profilePicture bio")
      .limit(10);
    res.json(users);
  } catch (err) {
    handleServerError(res, err, "Could not search users");
  }
});

// GET /api/users/me — current user
router.get("/me", protect, (req, res) => res.json(req.user));

// GET /api/users/:id — public profile
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(PUBLIC_USER_FIELDS);
    if (!user) return res.status(404).json({ message: "User not found" });
    const posts = await Post.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .populate("author", "username profilePicture")
      .populate("comments.user", "username profilePicture");
    res.json({ user, posts });
  } catch (err) {
    handleServerError(res, err, "Could not load profile");
  }
});

// PUT /api/users/profile — update own profile (text + optional picture)
router.put("/profile", protect, upload.single("profilePicture"), async (req, res) => {
  try {
    const { username, bio } = req.body;
    const updates = {};
    if (username !== undefined && typeof username !== "string") {
      return res.status(400).json({ message: "Username must be text" });
    }
    if (bio !== undefined && typeof bio !== "string") {
      return res.status(400).json({ message: "Bio must be text" });
    }

    if (username?.trim()) {
      const trimmedUsername = username.trim();
      if (trimmedUsername.length < 3 || trimmedUsername.length > MAX_USERNAME_LENGTH) {
        return res.status(400).json({ message: "Username must be between 3 and 30 characters" });
      }
      updates.username = trimmedUsername;
    }
    if (bio !== undefined) {
      if (bio.length > MAX_BIO_LENGTH) return res.status(400).json({ message: "Bio must be 160 characters or less" });
      updates.bio = bio;
    }
    if (req.file) updates.profilePicture = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      returnDocument: "after",
      runValidators: true,
    }).select("-password");
    res.json(user);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Username already in use" });
    return handleServerError(res, err, "Could not update profile");
  }
});

// PUT /api/users/:id/follow — toggle follow
router.put("/:id/follow", protect, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: "You cannot follow yourself" });
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found" });
    const isFollowing = req.user.following.map(String).includes(req.params.id);
    if (isFollowing) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user._id } });
      
      await Notification.create({
        recipient: req.params.id,
        sender: req.user._id,
        type: "follow",
      });
    }
    res.json({ following: !isFollowing });
  } catch (err) {
    handleServerError(res, err, "Could not update follow status");
  }
});

export default router;
