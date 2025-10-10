import express from "express";
import { createVilla, getVillas, getVillaBySlug } from "../controllers/villaController.js";

const router = express.Router();

router.post("/", createVilla);
router.get("/", getVillas);
router.get("/:slug", getVillaBySlug);

export default router;
