import Villa from "../models/Villa.js";

export const createVilla = async (req, res) => {
  try {
    const villa = await Villa.create(req.body);
    res.status(201).json({ success: true, data: villa });
  } catch (err) {
    console.error("❌ createVilla error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getVillas = async (req, res) => {
  try {
    const villas = await Villa.find();
    res.json({ success: true, data: villas });
  } catch (err) {
    console.error("❌ getVillas error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getVillaBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // ✅ Handle sub-rooms (villa-panorea-101 → villa-panorea)
    const baseSlug = slug.startsWith("villa-panorea")
      ? "villa-panorea"
      : slug;

    const villa = await Villa.findOne({ slug: baseSlug });
    if (!villa) return res.status(404).json({ error: "Villa not found" });

    res.json({ success: true, data: villa });
  } catch (err) {
    console.error("❌ getVillaBySlug error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
