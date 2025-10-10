// node scripts/seedRooms.js
import "dotenv/config.js";
import mongoose from "mongoose";
import crypto from "crypto";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import Room from "../src/models/Room.js";

async function main() {
  const MONGO_URI = process.env.MONGO_URI;
  const SITE_URL  = process.env.SITE_URL || "https://smartcompanion-h9bqcgcqcegaecd7.italynorth-01.azurewebsites.net";

  if (!MONGO_URI) {
    console.error("❌ Missing MONGO_URI in .env");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB connected");

  // The 7 rooms:
  const rooms = [
    "villa-panorea-101",
    "villa-panorea-102",
    "villa-panorea-103",
    "villa-panorea-104",
    "villa-panorea-105",
    "villa-panorea-106",
    "villa-panorea-107",
  ];

  if (!fs.existsSync("qrs")) fs.mkdirSync("qrs");

  for (const roomId of rooms) {
    // Upsert: keep existing token if present, otherwise create a new one
    let room = await Room.findOne({ roomId });
    if (!room) {
      room = await Room.create({
        roomId,
        accessToken: crypto.randomBytes(16).toString("hex"),
        villa: "villa-panorea",
      });
      console.log(`🆕 Created ${roomId}`);
    } else {
      console.log(`ℹ️  Exists ${roomId}`);
    }

    // Build the secure link embedded in QR
    const url = `${SITE_URL}/villa/${roomId}?token=${room.accessToken}`;

    // Generate a QR PNG
    const pngPath = path.join("qrs", `${roomId}.png`);
    await QRCode.toFile(pngPath, url, { width: 512, margin: 2 });
    console.log(`✅ QR saved: ${pngPath}`);
    console.log(`   🔗 ${url}\n`);
  }

  await mongoose.disconnect();
  console.log("✅ Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
