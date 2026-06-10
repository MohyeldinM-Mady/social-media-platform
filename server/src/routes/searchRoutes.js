import express from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";
import protect from "../middlewares/authMiddleware.js";
import { escapeRegex, handleServerError, normalizeSearchQuery } from "../utils/requestUtils.js";

const router = express.Router();

// GET /api/search?q=keyword
router.get("/", protect, async (req, res) => {
  try {
    const q = normalizeSearchQuery(req.query.q);
    if (!q) return res.json({ users: [], posts: [] });

    // Search users by username (regex)
    const users = await User.find({ username: { $regex: escapeRegex(q), $options: "i" } })
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
    handleServerError(res, err, "Could not search");
  }
});

export default router;
