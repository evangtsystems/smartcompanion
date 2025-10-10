import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "defaultsecret");
    req.owner = decoded.id;
    next();
  } catch (err) {
    console.error("❌ Invalid token:", err.message);
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
