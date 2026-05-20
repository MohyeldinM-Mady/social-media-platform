import express from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";
import protect from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// GET /api/users/search?q=
router.get("/search", protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) return res.json([]);
    const users = await User.find({ username: { $regex: q, $options: "i" } })
      .select("username profilePicture bio")
      .limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/me — current user
router.get("/me", protect, (req, res) => res.json(req.user));

// GET /api/users/:id — public profile
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    const posts = await Post.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .populate("author", "username profilePicture")
      .populate("comments.user", "username profilePicture");
    res.json({ user, posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/profile — update own profile (text + optional picture)
router.put("/profile", protect, upload.single("profilePicture"), async (req, res) => {
  try {
    const { username, bio } = req.body;
    const updates = {};
    if (username?.trim()) updates.username = username.trim();
    if (bio !== undefined) updates.bio = bio;
    if (req.file) updates.profilePicture = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
      await User.findByIdAndUpdate(req.user._id, { $push: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $push: { followers: req.user._id } });
    }
    res.json({ following: !isFollowing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
