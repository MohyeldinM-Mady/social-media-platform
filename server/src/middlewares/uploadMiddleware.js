import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const allowedTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/gif", ".gif"],
  ["image/webp", ".webp"],
]);

const storage = multer.memoryStorage();

const hasValidImageSignature = (buffer, mimetype) => {
  if (!buffer || buffer.length < 12) return false;

  if (mimetype === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (mimetype === "image/png") {
    return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  if (mimetype === "image/gif") {
    const signature = buffer.subarray(0, 6).toString("ascii");
    return signature === "GIF87a" || signature === "GIF89a";
  }

  if (mimetype === "image/webp") {
    return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  }

  return false;
};

const fileFilter = (req, file, cb) => {
  if (!allowedTypes.has(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, GIF, and WebP images are allowed"), false);
  }

  return cb(null, true);
};

const baseUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const persistValidatedImage = async (req, res, next) => {
  try {
    if (!req.file) return next();

    if (!hasValidImageSignature(req.file.buffer, req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid image file" });
    }

    const ext = allowedTypes.get(req.file.mimetype);
    const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    await fs.promises.writeFile(path.join(uploadDir, filename), req.file.buffer, { flag: "wx" });

    req.file.filename = filename;
    req.file.path = path.join(uploadDir, filename);
    delete req.file.buffer;

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Image upload failed" });
  }
};

export default {
  single(fieldName) {
    return [baseUpload.single(fieldName), persistValidatedImage];
  },
};
