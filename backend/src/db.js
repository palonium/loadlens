import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new pg.Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT
});

pool.on("error", (err) => {
  console.error("❌ Ошибка в пуле подключений:", err);
  process.exit(-1);
});

export const query = (text, params) => pool.query(text, params);
