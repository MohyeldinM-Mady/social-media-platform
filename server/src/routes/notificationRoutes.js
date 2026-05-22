import express from "express";
import Notification from "../models/Notification.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/notifications
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .populate("sender", "username profilePicture")
      .populate("post", "content");
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Not found" });
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/read-all
router.put("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
