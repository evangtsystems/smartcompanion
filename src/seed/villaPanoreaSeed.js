import mongoose from "mongoose";
import dotenv from "dotenv";
import Villa from "../models/Villa.js";

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const villa = {
      name: "Villa Panorea",
      slug: "villa-panorea",
      address: "Moraitika, Corfu, Greece",
      location: "Moraitika, Corfu",
      about:
        "Villa Panorea is a family-run accommodation surrounded by lush gardens, located a short walk from the beach in Moraitika, Corfu. It offers comfortable apartments, studios, and double rooms with modern amenities and authentic hospitality.",
      welcomeMessage:
        "Welcome to Villa Panorea! We’re delighted to have you with us. Feel at home and enjoy your stay in beautiful Moraitika.",
      rooms: [
        {
          name: "Apartments",
          description:
            "Spacious two-bedroom apartments with a living room, kitchenette, and balcony — perfect for families or groups seeking comfort and space.",
          capacity: 2,
          amenities: [
            "Air conditioning",
            "Wi-Fi",
            "Kitchenette",
            "Balcony",
            "Flat-screen TV",
            "Private bathroom",
          ],
          images: [],
        },
        {
          name: "Studios",
          description:
            "Fully equipped studios ideal for couples, featuring a kitchenette, bathroom, and private terrace with garden views.",
          capacity: 4,
          amenities: [
            "Air conditioning",
            "Wi-Fi",
            "Kitchenette",
            "Terrace",
            "Private bathroom",
          ],
          images: [],
        },
        {
          name: "Double Room",
          description:
            "Cozy double room with two single beds, en-suite bathroom, and a private terrace — ideal for short stays.",
          capacity: 1,
          amenities: [
            "Air conditioning",
            "Wi-Fi",
            "Fridge",
            "Terrace",
            "Private bathroom",
          ],
          images: [],
        },
      ],
    };

    await Villa.deleteMany();
    await Villa.create(villa);

    console.log("✅ Villa Panorea Smart Companion data seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
};

seed();
