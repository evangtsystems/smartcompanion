import express from "express";
import PushSubscription from "../models/PushSubscription.js";

const router = express.Router();

// 🔔 Subscribe endpoint
router.post("/subscribe", async (req, res) => {
  const { roomId, subscription } = req.body;
  if (!subscription?.endpoint) return res.status(400).json({ error: "Invalid subscription" });

  try {
    await PushSubscription.updateOne(
      { endpoint: subscription.endpoint },
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        roomId,
        createdAt: new Date(),
      },
      { upsert: true }
    );

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("❌ Push subscribe error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
