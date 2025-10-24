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
import nodemailer from "nodemailer";
import MessageRead from "./src/models/MessageRead.js";
import { Resend } from "resend";




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
const resend = new Resend(process.env.RESEND_API_KEY);
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

 // ✅ Push + Email fallback (Safari-safe)


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendPushToRoom(roomId, { title, body }) {
  try {
    const room = await Room.findOne({ roomId });
    const token = room?.accessToken || "";
    const guestEmail = room?.guestEmail || null;

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

    // ✅ Fetch all push subscriptions for this room or global
    const subs = await PushSubscription.find({
      $or: [{ roomId }, { roomId: "global" }],
    });

    // ✅ No push subs → directly fallback
    if (!subs.length) {
      console.log(`⚠️ No push subscriptions found — using email fallback.`);
      if (guestEmail) await sendEmailFallback(guestEmail, title, body, fullUrl);
      else console.warn("⚠️ No guest email found for this room.");
      return;
    }

    console.log(`📦 Sending ${subs.length} push notifications for room: ${roomId}`);

    const BATCH_SIZE = 10;
    let successCount = 0;

    for (let i = 0; i < subs.length; i += BATCH_SIZE) {
      const batch = subs.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (sub) => {
          try {
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: sub.keys },
              payload,
              { TTL: 60, urgency: "high" }
            );
            successCount++;
          } catch (err) {
            console.warn(`⚠️ Push failed (${err.statusCode || err.message || "no-code"})`);

            // Delete only expired subs, not all
            if (err.statusCode === 410 || err.statusCode === 404) {
              await PushSubscription.deleteOne({ endpoint: sub.endpoint });
              console.log("🗑 Removed expired subscription");
            }

            // ✅ Always fallback on ANY push error (covers iOS too)
            if (guestEmail) {
              console.log(`📨 Push failed — emailing ${guestEmail}`);
              await sendEmailFallback(guestEmail, title, body, fullUrl);
            } else {
              console.warn("⚠️ No guest email set for fallback.");
            }
          }
        })
      );

      await new Promise((res) => setTimeout(res, 500));
    }

    // ✅ If *none* succeeded → global fallback
    if (successCount === 0 && guestEmail) {
      console.log(`📭 All push attempts failed — emailing ${guestEmail}`);
      await sendEmailFallback(guestEmail, title, body, fullUrl);
    }

    console.log(`✅ Push attempt complete for room: ${roomId}`);
  } catch (err) {
    console.error("❌ sendPushToRoom fatal error:", err);
    const room = await Room.findOne({ roomId });
    const guestEmail = room?.guestEmail;
    if (guestEmail) {
      console.log(`📨 Fatal error — emailing ${guestEmail}`);
      await sendEmailFallback(guestEmail, title, body);
    } else {
      console.warn("⚠️ Fallback failed — no guest email stored for this room");
    }
  }
}


// keep your existing: import { Resend } from "resend";
// and: const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmailFallback(to, title, body, url) {
  if (!to) {
    console.warn("⚠️ No recipient email for fallback");
    return;
  }

  const subject = title || "Smart Companion Update";
  const html = `
    <div style="font-family:Arial,sans-serif;color:#333;padding:16px">
      <h3 style="margin:0 0 8px 0">${subject}</h3>
      <p style="margin:0 0 12px 0">${body || "You have a new message"}</p>
      ${
        url
          ? `<a href="${url}"
                style="display:inline-block;background:#1f3b2e;color:#fff;
                       padding:10px 14px;border-radius:8px;text-decoration:none">
               Open Chat
             </a>`
          : ""
      }
      <div style="margin-top:12px;font-size:12px;color:#777">
        If the button doesn’t work, open: <br/>
        <span style="word-break:break-all">${url || ""}</span>
      </div>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: "Smart Companion <info@corfutransfersapp.com>",
      to,
      subject,
      html,
      reply_to: "info@corfutransfersapp.com", // optional
    });
    console.log(`📧 Fallback email sent to ${to}`, result?.id ? `id=${result.id}` : "");
  } catch (e) {
    console.error("❌ Resend fallback failed:", e);
  }
}







  // ✅ Socket.IO event handlers
  io.on("connection", (socket) => {
    console.log("🟢 New user connected:", socket.id);

    socket.on("markRead", async ({ roomId, messageIds, userType }) => {
  try {
    if (!Array.isArray(messageIds) || messageIds.length === 0) return;

    // record read events individually
    await Promise.all(
      messageIds.map((messageId) =>
        MessageRead.updateOne(
          { roomId, messageId, userType },
          { $set: { timestamp: new Date() } },
          { upsert: true }
        )
      )
    );

    // ✅ Emit each message’s read event separately for instant UI updates
    messageIds.forEach((id) => {
      io.to(roomId).emit("messagesRead", { messageIds: [id], userType,roomId });
    });

    console.log(`👁️ ${userType} read ${messageIds.length} messages in ${roomId}`);
  } catch (err) {
    console.error("❌ markRead error:", err);
  }
});



    // 👑 Admin joins dashboard
    socket.on("adminJoin", async () => {
      console.log("👑 Admin joined");
      socket.join("admins");
      const rooms = await Message.distinct("roomId");
      socket.emit("roomsList", rooms);
    });

    // 🏠 Join specific room
    // 🏠 Admin or guest joins a room
socket.on("joinRoom", async (roomId) => {
  try {
    socket.join(roomId);
    console.log(`👥 ${socket.id} joined room ${roomId}`);

    // 1️⃣ Fetch all messages for that room
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });

    // 2️⃣ Fetch all guest read receipts for this room
    const guestReads = await MessageRead.find({ roomId, userType: "guest" });
    const guestReadIds = new Set(guestReads.map((r) => r.messageId.toString()));

    // 3️⃣ Merge read status into messages
    const enrichedMessages = messages.map((m) => ({
      ...m.toObject(),
      read: guestReadIds.has(m._id.toString()),
    }));

    // 4️⃣ Send to client
    socket.emit("chatHistory", enrichedMessages);

    console.log(`📜 Sent chat history for ${roomId} (${messages.length} messages)`);
  } catch (err) {
    console.error("❌ Error loading chat history:", err);
  }
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

// ✅ Track when user opens the chat link or notification
server.get("/api/tracking/open", async (req, res) => {
  try {
    const { roomId, userType = "guest" } = req.query;

    if (!roomId) return res.status(400).send("Missing roomId");

    await MessageRead.create({ roomId, userType });
    console.log(`👁️  ${userType} opened chat for room ${roomId}`);

    // Redirect to the actual chat page
    const token = req.query.token ? `?token=${req.query.token}` : "";
    res.redirect(`/villa/${encodeURIComponent(roomId)}${token}`);
  } catch (err) {
    console.error("❌ Tracking error:", err);
    res.status(500).send("Server error");
  }
});

// ✅ View last 50 “read” events
server.get("/api/tracking/list", async (req, res) => {
  const reads = await MessageRead.find().sort({ timestamp: -1 }).limit(50);
  res.json(reads);
});
// ✅ Email Fallback API (Resend version)
server.post("/api/email/fallback", async (req, res) => {
  try {
    const { email, subject = "📩 Smart Companion Fallback", message = "User registered for email fallback" } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    // Debug log for Azure
    console.log("📧 Sending via Resend. Key loaded:", !!process.env.RESEND_API_KEY);

    const result = await resend.emails.send({
      from: "Smart Companion <info@corfutransfersapp.com>",
      to: email,
      subject,
      html: `
        <div style="font-family:Arial,sans-serif;color:#333;padding:10px">
          <h3>${subject}</h3>
          <p>${message}</p>
        </div>
      `,
    });

    console.log("✅ Resend response:", result);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ /api/email/fallback failed:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});



// ✅ Admin API: Update guest email for a room
server.post("/api/admin/update-room-email", async (req, res) => {
  try {
    const { roomId, guestEmail } = req.body;
    if (!roomId || !guestEmail) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    await Room.updateOne(
      { roomId },
      { $set: { guestEmail } },
      { upsert: false }
    );

    console.log(`✏️ Updated guest email for ${roomId}: ${guestEmail}`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error updating guest email:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ✅ Fetch all rooms (for admin dashboard)
server.get("/api/admin/rooms", async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json({ success: true, rooms });
  } catch (err) {
    console.error("❌ Error fetching rooms:", err);
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
