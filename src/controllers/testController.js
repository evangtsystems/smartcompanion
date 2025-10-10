import Test from "../models/Test.js";

export const createMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const doc = await Test.create({ message });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error("❌ createMessage error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const docs = await Test.find().sort({ createdAt: -1 });
    res.json({ success: true, data: docs });
  } catch (err) {
    console.error("❌ getMessages error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
