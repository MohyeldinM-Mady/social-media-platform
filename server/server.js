import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./src/config/db.js";
import authRouter from "./src/routes/authRoutes.js";
import postRouter from "./src/routes/postRoutes.js";
import userRouter from "./src/routes/userRoutes.js";
import searchRouter from "./src/routes/searchRoutes.js";
import notificationRouter from "./src/routes/notificationRoutes.js";

dotenv.config();

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});
app.use(express.json({ limit: "1mb" }));

// Serve uploaded images
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "public, max-age=86400");
    },
  }),
);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);
app.use("/api/users", userRouter);
app.use("/api/search", searchRouter);
app.use("/api/notifications", notificationRouter);

app.get("/", (req, res) => res.json({ message: "Server is running" }));

app.use((err, req, res, next) => {
  if (err) {
    console.error(err);
    const status = err.name === "MulterError" || err.message?.includes("images are allowed") ? 400 : 500;
    const message = status === 400 ? err.message : "Internal server error";
    return res.status(status).json({ message });
  }

  return next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
