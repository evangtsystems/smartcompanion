import express from "express";
import {
  createServiceRequest,
  getRequestsByVilla,
  getAllRequests,
  updateRequestStatus,
} from "../controllers/serviceRequestController.js";

const router = express.Router();

router.get("/", getAllRequests);
router.post("/", createServiceRequest);
router.get("/:villaId", getRequestsByVilla);
router.patch("/:id", updateRequestStatus);

export default router;
