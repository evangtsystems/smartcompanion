import mongoose from "mongoose";

const RoomTypeSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Apartment, Studio, Double Room
  description: String,
  capacity: Number,
  amenities: [String],
  images: [String],
});

const VillaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, required: true }, // e.g. "villa-panorea"
  address: String,
  location: String, // e.g. "Moraitika, Corfu"
  about: String,
  welcomeMessage: String,
  rooms: [RoomTypeSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Villa || mongoose.model("Villa", VillaSchema);
