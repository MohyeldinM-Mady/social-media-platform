import express from "express";
import User from "../models/User.js";
import * as TokenGenerator from "./TokenGenerator.js";
import { sendWelcomeEmail } from "../utils/mailer.js";

const router = express.Router();

const safeUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  profilePicture: user.profilePicture,
  bio: user.bio,
  followers: user.followers,
  following: user.following,
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ message: "Email or username already in use" });
    const user = await new User({ username, email, password }).save();
    sendWelcomeEmail(user.email, user.username);
    const token = TokenGenerator.generateToken(user);
    res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const match = await user.comparePassword(password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });
    const token = TokenGenerator.generateToken(user);
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
