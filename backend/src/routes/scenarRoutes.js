import express from "express";
import multer from "multer";
import { 
  saveScenario, 
  uploadImage, 
  getScenario, 
  getScenarioByTestId, 
  saveScenarioResult, 
  getScenarioResults, 
  getScenarioStats,
  getScenarioResultsByTest,
  getScenarioStatsByTest,
deleteScenarioResult,
deleteScenarioCompletely } from "../controllers/scenarioController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "public/uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  }
});

const upload = multer({ storage });

router.post("/upload", upload.single("image"), uploadImage);
router.post("/", saveScenario);
router.get("/results", getScenarioResults);
router.get("/stats", getScenarioStats);  
router.get("/:id", getScenario);
router.get("/by-test/:test_id", getScenarioByTestId);
router.post("/complete/:scenario_id", authMiddleware, saveScenarioResult);
router.get("/results/:id", authMiddleware, getScenarioResultsByTest);
router.get("/stats/:id", authMiddleware, getScenarioStatsByTest);
router.delete("/results/:test_id", authMiddleware, deleteScenarioResult);
router.delete("/:test_id", authMiddleware, deleteScenarioCompletely);


export default router;
