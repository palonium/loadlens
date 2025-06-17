import express from "express";
import { assignUsersToTest } from "../controllers/testUserController.js";
import { getAssignedTestsForUser, getAllTestsWithStats, markTestAsCompleted, markTestAsViewedByAdmin, getLastCreatedTestsWithStats, getUsersAssignedToTest, deleteTestResult  } from "../controllers/testUserController.js";
import { getLatestAssignedTests } from "../controllers/testUserController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", assignUsersToTest);
router.get("/me", authMiddleware, getAssignedTestsForUser);
router.get("/tests", authMiddleware, getAllTestsWithStats);
router.post("/complete/:test_id", authMiddleware, markTestAsCompleted);
router.patch("/viewed/:test_id", authMiddleware, markTestAsViewedByAdmin);
router.get("/latest", authMiddleware, getLatestAssignedTests);
router.get("/created", authMiddleware, getLastCreatedTestsWithStats);
router.get("/:test_id", getUsersAssignedToTest);
router.delete("/:test_id", authMiddleware, deleteTestResult);


export default router;
