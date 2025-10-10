import ServiceRequest from "../models/ServiceRequest.js";

export const createServiceRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.create(req.body);
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    console.error("❌ createServiceRequest error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


export const getAllRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find().sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (err) {
    console.error("❌ getAllRequests error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await ServiceRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ updateRequestStatus error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


export const getRequestsByVilla = async (req, res) => {
  try {
    const { villaId } = req.params;
    const requests = await ServiceRequest.find({ villa: villaId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: requests });
  } catch (err) {
    console.error("❌ getRequestsByVilla error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
