import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { logout } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);

export default router;
