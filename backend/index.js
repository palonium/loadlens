import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

console.log("Импортируем authRoutes");
import authRoutes from "./src/routes/authRoutes.js";
console.log("✅ authRoutes загружен");

console.log("Импортируем scenarRoutes");
import scenarRoutes from "./src/routes/scenarRoutes.js";
console.log("✅ scenarRoutes загружен");

console.log("Импортируем userRoutes");
import userRoutes from "./src/routes/userRoutes.js";
console.log("✅ userRoutes загружен");

console.log("Импортируем testUserRoutes");
import testUserRoutes from "./src/routes/testUserRoutes.js";
console.log("✅ testUserRoutes загружен");

console.log("Импортируем abRoutes");
import abRoutes from "./src/routes/abRoutes.js";
console.log("✅ abRoutes загружен");

console.log("Импортируем uploadRoutes");
import uploadRoutes from "./src/routes/uploadRoutes.js";
console.log("✅ uploadRoutes загружен");

console.log("Импортируем reportRoutes");
import reportRoutes from "./src/routes/reportRoutes.js";
console.log("✅ reportRoutes загружен");

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: "20mb" }));

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/scenarios", scenarRoutes);
app.use("/api/users", userRoutes);
app.use("/api/test_users", testUserRoutes);
app.use("/api", abRoutes);
app.use("/api", uploadRoutes);
app.use("/api/reports", reportRoutes);

app.listen(port, () => {
  console.log("✅ Server running on port 3000");
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});