import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query } from "../db.js";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads", "reports");
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const uniqueName = `${timestamp}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

export const upload = multer({ storage });

export const saveReport = async (req, res) => {
  try {
    const { test_id } = req.body;
    const file = req.file;
    const user_id = req.user?.id;

    if (!file || !test_id || !user_id) {
      return res.status(400).json({ error: "Недостаточно данных" });
    }

    const filePath = `/uploads/reports/${file.filename}`;

    await query(
      `INSERT INTO pdf_reports (test_id, generated_by, file_path, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [test_id, user_id, filePath]
    );
    
    res.status(200).json({ success: true, filePath });
  } catch (error) {
    console.error("Ошибка при сохранении отчёта:", error);
    res.status(500).json({ error: "Ошибка сервера при сохранении отчёта" });
  }
};
