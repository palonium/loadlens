import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  }
});

export const upload = multer({ storage });

export const handleUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Файл не получен" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
};
