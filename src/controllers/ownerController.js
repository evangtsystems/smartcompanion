import Owner from "../models/Owner.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// POST /api/owner/register
export const registerOwner = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const exists = await Owner.findOne({ email });
    if (exists) return res.status(400).json({ error: "Owner already exists" });

    const owner = await Owner.create({ email, password, name });
    res.status(201).json({ success: true, data: owner });
  } catch (err) {
    console.error("❌ registerOwner error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/owner/login
export const loginOwner = async (req, res) => {
  try {
    const { email, password } = req.body;
    const owner = await Owner.findOne({ email });
    if (!owner || !(await owner.matchPassword(password)))
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: owner._id }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ success: true, token, owner: { id: owner._id, name: owner.name, email: owner.email } });
  } catch (err) {
    console.error("❌ loginOwner error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
