import express from "express";
import next from "next";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import apiRouter from "./src/routes/index.js";
import webpush from "web-push";
import PushSubscription from "./src/models/PushSubscription.js";
import Room from "./src/models/Room.js";



dotenv.config();

// ✅ Web Push setup
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:you@example.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  console.log("✅ Web Push configured");
} else {
  console.warn("⚠️ VAPID keys not found in .env — push notifications disabled");
}


const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const server = express();
  const httpServer = http.createServer(server);

  // ✅ Socket.IO setup
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", // ✅ Azure: allow any origin
      methods: ["GET", "POST"],
    },
  });

  // ✅ Middleware
  server.use(cors({ origin: true, credentials: true }));
  server.use(express.json({ limit: "10mb" }));
  server.use(cookieParser());

  // ✅ MongoDB connection
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ MongoDB connected");
    } else {
      console.log("⚠️ No MONGO_URI found in .env — skipping DB connection");
    }
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }

  // ✅ Message model (kept lightweight)
  const messageSchema = new mongoose.Schema({
    roomId: String,
    sender: String, // "guest" or "host"
    text: String,
    timestamp: { type: Date, default: Date.now },
  });
  const Message =
    mongoose.models.Message || mongoose.model("Message", messageSchema);

 // ✅ Optimized: Reliable & Fast Web Push Delivery
async function sendPushToRoom(roomId, { title, body }) {
  try {
    const subs = await PushSubscription.find({
      $or: [{ roomId }, { roomId: "global" }],
    });

    if (!subs.length) {
      console.log(`ℹ️ No push subscriptions found for room: ${roomId}`);
      return;
    }

    const room = await Room.findOne({ roomId });
    const token = room?.accessToken || "";

    // 👇 Use SITE_URL from .env, fallback to Azure
    const baseUrl =
      process.env.SITE_URL ||
      "https://smartcompanion-h9bqcgcqcegaecd7.italynorth-01.azurewebsites.net";

    const fullUrl = `${baseUrl}/villa/${encodeURIComponent(roomId)}${
      token ? `?token=${token}` : ""
    }`;

    const payload = JSON.stringify({
      title: title || "Smart Companion",
      body: body || "You have a new message",
      url: fullUrl,
    });

    console.log(`📦 Sending ${subs.length} push notifications for room: ${roomId}`);

    // ✅ Send in batches (prevent overload on Azure free plan)
    const BATCH_SIZE = 10;
    for (let i = 0; i < subs.length; i += BATCH_SIZE) {
      const batch = subs.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (sub) => {
          try {
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: sub.keys },
              payload,
              {
                TTL: 60, // ⏱ expire after 1 minute
                urgency: "high", // ⚡ deliver ASAP
                topic: "smart-companion", // group messages
              }
            );
          } catch (err) {
            if (err.statusCode === 410 || err.statusCode === 404) {
              await PushSubscription.deleteOne({ endpoint: sub.endpoint });
              console.log("🗑 Removed expired push subscription");
            } else {
              console.error(
                `❌ Push send error for ${sub.endpoint}:`,
                err.statusCode,
                err.body || err
              );
            }
          }
        })
      );
      // Small delay between batches to avoid rate limits
      await new Promise((res) => setTimeout(res, 500));
    }

    console.log(`✅ Push delivery attempt complete for room: ${roomId}`);
  } catch (e) {
    console.error("❌ sendPushToRoom error:", e);
  }
}





  // ✅ Socket.IO event handlers
  io.on("connection", (socket) => {
    console.log("🟢 New user connected:", socket.id);

    // 👑 Admin joins dashboard
    socket.on("adminJoin", async () => {
      console.log("👑 Admin joined");
      socket.join("admins");
      const rooms = await Message.distinct("roomId");
      socket.emit("roomsList", rooms);
    });

    // 🏠 Join specific room
    socket.on("joinRoom", async (roomId) => {
      socket.join(roomId);
      console.log(`🏠 User joined room: ${roomId}`);

      const history = await Message.find({ roomId })
        .sort({ timestamp: 1 })
        .limit(50);
      socket.emit("chatHistory", history);

      const rooms = await Message.distinct("roomId");
      io.to("admins").emit("updateRooms", rooms);
    });

    // 💬 Handle new message
    socket.on("sendMessage", async ({ roomId, sender, text }) => {
  if (!text || !roomId) return;
  const msg = await Message.create({ roomId, sender, text });
  socket.to(roomId).emit("newMessage", msg);
socket.emit("newMessage", msg);

  console.log(`💬 [${roomId}] ${sender}: ${text}`);

  if (sender === "guest") {
    io.to("admins").emit("guestMessageNotification", { roomId });
    const rooms = await Message.distinct("roomId");
    io.to("admins").emit("updateRooms", rooms);
  }

  // ✅ NEW: if host sent a message → send push notification
  // ✅ If host sent a message → send push notification to guests
if (sender === "host") {
  await sendPushToRoom(roomId, {
    title: "New message from your host",
    body: text,
  });
}


});


    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });

  // ✅ Express routes
  server.use("/api", apiRouter);

  // 🧹 Delete all chat messages
server.delete("/api/chat/delete-all", async (req, res) => {
  try {
    const result = await Message.deleteMany({});
    res.json({
      success: true,
      message: "All chat messages deleted successfully.",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("❌ Error deleting all messages:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// 🧩 Delete chat messages for a specific room
server.delete("/api/chat/delete-room/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const result = await Message.deleteMany({ roomId });
    res.json({
      success: true,
      message: `All messages deleted for room ${roomId}.`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("❌ Error deleting room messages:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


  // ✅ Health check for Azure
server.get("/health", (req, res) => res.send("OK"));

// ✅ Push Subscription API endpoint
server.post("/api/push/subscribe", async (req, res) => {
  try {
    const { roomId, subscription } = req.body;
    if (!roomId || !subscription) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    // Upsert (avoid duplicates)
    await PushSubscription.updateOne(
      { roomId, endpoint: subscription.endpoint },
      {
        $set: {
          roomId,
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        },
      },
      { upsert: true }
    );

    console.log(`🔔 Push subscription saved for room: ${roomId}`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error saving subscription:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


// ✅ Let Next.js handle *everything else*
server.all(/.*/, (req, res) => handle(req, res));



  // ✅ Start server
  const port = process.env.PORT || 8080; // Azure uses 8080 internally
  httpServer.listen(port, () => {
    console.log(`🚀 SmartCompanion running on port ${port}`);
  });
});
