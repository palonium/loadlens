import express from "express";
import { upload, saveReport } from "../controllers/reporController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, upload.single("file"), saveReport);

export default router;
