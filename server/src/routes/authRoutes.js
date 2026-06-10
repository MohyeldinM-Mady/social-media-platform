import express from "express";
import User from "../models/User.js";
import * as TokenGenerator from "./TokenGenerator.js";
import { sendWelcomeEmail } from "../utils/mailer.js";
import { handleServerError } from "../utils/requestUtils.js";

const router = express.Router();
const attempts = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_AUTH_ATTEMPTS = 20;

const authRateLimit = (req, res, next) => {
  const key = req.ip;
  const now = Date.now();
  const record = attempts.get(key) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (record.resetAt <= now) {
    record.count = 0;
    record.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  record.count += 1;
  attempts.set(key, record);

  if (record.count > MAX_AUTH_ATTEMPTS) {
    return res.status(429).json({ message: "Too many authentication attempts. Try again later." });
  }

  return next();
};

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
router.post("/register", authRateLimit, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (typeof username !== "string" || typeof email !== "string" || typeof password !== "string")
      return res.status(400).json({ message: "All fields are required" });

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedUsername.length < 3 || normalizedUsername.length > 30)
      return res.status(400).json({ message: "Username must be between 3 and 30 characters" });
    if (password.length < 8)
      return res.status(400).json({ message: "Password must be at least 8 characters" });

    const exists = await User.findOne({ $or: [{ email: normalizedEmail }, { username: normalizedUsername }] });
    if (exists) return res.status(400).json({ message: "Email or username already in use" });
    const user = await new User({ username: normalizedUsername, email: normalizedEmail, password }).save();
    sendWelcomeEmail(user.email, user.username);
    const token = TokenGenerator.generateToken(user);
    res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    handleServerError(res, err, "Registration failed");
  }
});

// POST /api/auth/login
router.post("/login", authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string")
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const match = await user.comparePassword(password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });
    const token = TokenGenerator.generateToken(user);
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    handleServerError(res, err, "Login failed");
  }
});

export default router;
