import express from "express";
import Room from "../models/Room.js";

const router = express.Router();

/**
 * GET /api/rooms/verify?roomId=&token=
 * Returns { valid: true/false }
 */
router.get("/verify", async (req, res) => {
  try {
    const { roomId, token } = req.query;
    if (!roomId || !token) {
      return res.status(400).json({ valid: false, error: "Missing roomId or token" });
    }
    const room = await Room.findOne({ roomId, accessToken: token });
    return res.json({ valid: !!room });
  } catch (e) {
    console.error("verify error:", e);
    return res.status(500).json({ valid: false });
  }
});

export default router;
