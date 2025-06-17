import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.cookies.token; // 🟢 теперь читаем из куки

  if (!token) return res.status(401).json({ error: "Token required" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
  }
};
