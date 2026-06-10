import express from "express";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import protect from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { getPagination, handleServerError } from "../utils/requestUtils.js";

const router = express.Router();
const MAX_POST_LENGTH = 500;
const MAX_COMMENT_LENGTH = 300;

// GET /api/posts — personalized feed (own + following)
router.get("/", protect, async (req, res) => {
  try {
    const { skip, limit } = getPagination(req.query);
    const ids = [...req.user.following, req.user._id];
    const posts = await Post.find({ author: { $in: ids } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username profilePicture")
      .populate("comments.user", "username profilePicture");
    res.json(posts);
  } catch (err) {
    handleServerError(res, err, "Could not load posts");
  }
});

// GET /api/posts/explore — all posts
router.get("/explore", protect, async (req, res) => {
  try {
    const { skip, limit } = getPagination(req.query);
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username profilePicture")
      .populate("comments.user", "username profilePicture");
    res.json(posts);
  } catch (err) {
    handleServerError(res, err, "Could not load posts");
  }
});

// POST /api/posts — create a post
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const { content } = req.body;
    if (typeof content !== "string" || !content.trim())
      return res.status(400).json({ message: "Content is required" });
    const trimmedContent = content.trim();
    if (trimmedContent.length > MAX_POST_LENGTH)
      return res.status(400).json({ message: `Content must be ${MAX_POST_LENGTH} characters or less` });

    const image = req.file ? `/uploads/${req.file.filename}` : "";
    const post = await Post.create({ author: req.user._id, content: trimmedContent, image });
    const populated = await post.populate("author", "username profilePicture");
    res.status(201).json(populated);
  } catch (err) {
    handleServerError(res, err, "Could not create post");
  }
});

// PUT /api/posts/:id — edit a post
router.put("/:id", protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (typeof content !== "string" || !content.trim())
      return res.status(400).json({ message: "Content is required" });
    const trimmedContent = content.trim();
    if (trimmedContent.length > MAX_POST_LENGTH)
      return res.status(400).json({ message: `Content must be ${MAX_POST_LENGTH} characters or less` });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    post.content = trimmedContent;
    await post.save();
    const populated = await post.populate("author", "username profilePicture");
    res.json(populated);
  } catch (err) {
    handleServerError(res, err, "Could not update post");
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
    handleServerError(res, err, "Could not delete post");
  }
});

// PUT /api/posts/:id/like — toggle like
router.put("/:id/like", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const uid = req.user._id.toString();
    const idx = post.likes.findIndex((id) => id.toString() === uid);
    if (idx === -1) {
      post.likes.push(req.user._id);
      if (post.author.toString() !== uid) {
        await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: "like",
          post: post._id,
        });
      }
    } else {
      post.likes.splice(idx, 1);
    }
    await post.save();
    res.json({ likes: post.likes });
  } catch (err) {
    handleServerError(res, err, "Could not update like");
  }
});

// POST /api/posts/:id/comments
router.post("/:id/comments", protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (typeof text !== "string" || !text.trim())
      return res.status(400).json({ message: "Comment text is required" });
    const trimmedText = text.trim();
    if (trimmedText.length > MAX_COMMENT_LENGTH)
      return res.status(400).json({ message: `Comment must be ${MAX_COMMENT_LENGTH} characters or less` });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    post.comments.push({ user: req.user._id, text: trimmedText });
    await post.save();
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: "comment",
        post: post._id,
      });
    }
    await post.populate("comments.user", "username profilePicture");
    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (err) {
    handleServerError(res, err, "Could not add comment");
  }
});

export default router;
