import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
    villa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Villa",
      required: true,
    },
    name: { type: String, required: true }, // guest name
    roomNumber: { type: String },
    requestType: {
      type: String,
      enum: ["cleaning", "dinner", "groceries", "other"],
      required: true,
    },
    message: { type: String },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ServiceRequest", serviceRequestSchema);
