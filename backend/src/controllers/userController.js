import { query } from "../db.js";

export const getAllUsers = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.age,
        u.email,
        COUNT(tu.*) FILTER (WHERE tu.test_id IS NOT NULL) AS assigned,
        COUNT(tu.*) FILTER (WHERE tu.completed = true) AS completed
      FROM users u
      LEFT JOIN test_users tu ON tu.user_id = u.id
      GROUP BY u.id
      ORDER BY u.first_name
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при получении пользователей:", err);
    res.status(500).json({ error: "DB error" });
  }
};


export const getAssignedScenarios = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await query(`
      SELECT s.id, s.task_text, s.environment_url
      FROM test_users tu
      JOIN scenarios s ON tu.test_id = s.test_id
      WHERE tu.user_id = $1
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Ошибка получения назначенных сценариев:", err);
    res.status(500).json({ error: "DB error" });
  }
};

export const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    await query("DELETE FROM test_users WHERE user_id = $1", [userId]); // сначала связи
    await query("DELETE FROM users WHERE id = $1", [userId]);           // потом сам пользователь
    res.json({ success: true });
  } catch (err) {
    console.error("Ошибка при удалении пользователя:", err);
    res.status(500).json({ error: "DB error" });
  }
};
