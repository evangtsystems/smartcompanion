import express from "express";
import { createMessage, getMessages } from "../controllers/testController.js";
import villaRoutes from "./villaRoutes.js";
import serviceRequestRoutes from "./serviceRequestRoutes.js";
import ownerRoutes from "./ownerRoutes.js";
import roomsRouter from "./rooms.js";
import pushRouter from "./push.js";


const router = express.Router();

router.get("/test", getMessages);
router.post("/test", createMessage);
router.get("/ping", (req, res) => res.json({ success: true, message: "pong" }));


// ✅ this line mounts your villa routes correctly
router.use("/villas", villaRoutes);
router.use("/requests", serviceRequestRoutes);
router.use("/owner", ownerRoutes);
router.use("/rooms", roomsRouter);
router.use("/push", pushRouter);

export default router;
