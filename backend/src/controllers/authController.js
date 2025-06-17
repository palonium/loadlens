import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../db.js";

export const register = async (req, res) => {
  const { email, password, first_name, last_name, age } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await query(
      `INSERT INTO users (email, password, first_name, last_name, age, role)
       VALUES ($1, $2, $3, $4, $5, 'user')
       RETURNING id, email, first_name, last_name, age, role`,
      [email, hashedPassword, first_name, last_name, age]
    );

    res.status(201).json(userResult.rows[0]);
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
  
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: "User not found" });

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email, first_name: user.first_name }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,       // если HTTPS — true
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/"            // 🔴 обязательно
    });
  
    res.json({ user: { id: user.id, email: user.email, role: user.role, first_name: user.first_name } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "DB error" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    path: "/"            // 🔴 тот же путь, что при установке
  });

  res.json({ message: "Logged out" });
};



export const getMe = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.json({ user: req.user });
};
