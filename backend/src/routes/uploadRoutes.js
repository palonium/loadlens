import express from "express";
import { upload, handleUpload } from "../controllers/uploadController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/upload", authMiddleware, upload.single("image"), handleUpload);

export default router;
