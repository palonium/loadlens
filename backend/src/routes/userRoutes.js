import express from "express";
import { getAllUsers, getAssignedScenarios, deleteUser} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/assigned", authMiddleware, getAssignedScenarios);
router.delete("/:id", deleteUser);

export default router;
