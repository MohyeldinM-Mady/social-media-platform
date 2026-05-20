import express from "express";
import Post from "../models/Post.js";
import protect from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// GET /api/posts — personalized feed (own + following)
router.get("/", protect, async (req, res) => {
  try {
    const ids = [...req.user.following, req.user._id];
    const posts = await Post.find({ author: { $in: ids } })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("author", "username profilePicture")
      .populate("comments.user", "username profilePicture");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/posts/explore — all posts
router.get("/explore", protect, async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("author", "username profilePicture")
      .populate("comments.user", "username profilePicture");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts — create a post
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: "Content is required" });
    const image = req.file ? `/uploads/${req.file.filename}` : "";
    const post = await Post.create({ author: req.user._id, content, image });
    const populated = await post.populate("author", "username profilePicture");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/posts/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/posts/:id/like — toggle like
router.put("/:id/like", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const uid = req.user._id.toString();
    const idx = post.likes.findIndex((id) => id.toString() === uid);
    if (idx === -1) post.likes.push(req.user._id);
    else post.likes.splice(idx, 1);
    await post.save();
    res.json({ likes: post.likes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts/:id/comments
router.post("/:id/comments", protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Comment text is required" });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    post.comments.push({ user: req.user._id, text });
    await post.save();
    await post.populate("comments.user", "username profilePicture");
    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
