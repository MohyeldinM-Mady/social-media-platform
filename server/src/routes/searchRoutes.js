import express from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/search?q=keyword
router.get("/", protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) return res.json({ users: [], posts: [] });

    // Search users by username (regex)
    const users = await User.find({ username: { $regex: q, $options: "i" } })
      .select("username profilePicture bio")
      .limit(10);

    // Search posts by text index
    const posts = await Post.find({ $text: { $search: q } })
      .sort({ score: { $meta: "textScore" }, createdAt: -1 })
      .limit(10)
      .populate("author", "username profilePicture")
      .populate("comments.user", "username profilePicture");

    res.json({ users, posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
