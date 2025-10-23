import mongoose from "mongoose";

const messageReadSchema = new mongoose.Schema({
  roomId: String,
  messageId: String,         // optional if you later want per-message tracking
  userType: String,          // "guest" or "host"
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.MessageRead ||
  mongoose.model("MessageRead", messageReadSchema);
