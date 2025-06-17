import express from "express";
import { createAbTest, getQuestionsByTest, getAbResults, getAbStats, saveAbAnswer, getAbResultsByTest, getAbStatsByTest, deleteAbTest } from "../controllers/abController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/ab-tests", authMiddleware, createAbTest);
router.get("/questions/by-test/:test_id", authMiddleware, getQuestionsByTest);
router.get("/ab/results", authMiddleware, getAbResults);
router.post("/ab/answer", authMiddleware, saveAbAnswer);
router.get("/ab/results/:id", authMiddleware, getAbResultsByTest);
router.get("/ab/stats/:id", authMiddleware, getAbStatsByTest);
router.delete("/ab-tests/:test_id", authMiddleware, deleteAbTest);

export default router;
