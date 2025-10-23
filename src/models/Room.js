import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, unique: true, required: true }, // e.g. "villa-panorea-101"
    accessToken: { type: String, required: true },          // random secret for QR
    villa: { type: String, default: "villa-panorea" },      // optional metadata

    // ✅ Add this new field:
    guestEmail: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Room || mongoose.model("Room", roomSchema);
