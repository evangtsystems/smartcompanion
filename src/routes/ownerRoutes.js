import express from "express";
import { registerOwner, loginOwner } from "../controllers/ownerController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/register", registerOwner);
router.post("/login", loginOwner);


// ✅ Protected route example
router.get("/dashboard", protect, (req, res) => {
  res.json({ success: true, message: "Welcome to your secure dashboard!" });
});

export default router;
