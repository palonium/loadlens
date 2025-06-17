import { query } from "../db.js";

export const assignUsersToTest = async (req, res) => {
  const { test_id, user_ids } = req.body;

  if (!test_id || !user_ids || !Array.isArray(user_ids)) {
    return res.status(400).json({ error: "Недопустимые данные" });
  }

  try {
    // 🧹 Удалим предыдущие назначения перед вставкой новых
    await query(`DELETE FROM test_users WHERE test_id = $1`, [test_id]);

    if (user_ids.length === 0) {
      return res.json({ success: true });
    }

    const values = user_ids.map(
      (user_id) => `(${user_id}, ${test_id})`
    ).join(", ");

    await query(
      `INSERT INTO test_users (user_id, test_id)
       VALUES ${values}`
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Ошибка при назначении пользователей:", err);
    res.status(500).json({ error: "DB error" });
  }
};


export const getAssignedTestsForUser = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const result = await query(
      `SELECT tu.*, t.title, t.type AS test_type
       FROM test_users tu
       JOIN tests t ON tu.test_id = t.id
       WHERE tu.user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Ошибка при получении назначенных тестов:", err);
    res.status(500).json({ error: "DB error" });
  }
};

export const getAllTestsWithStats = async (req, res) => {
  const isAdmin = req.user?.role === "admin";
  if (!isAdmin) return res.status(403).json({ error: "Access denied" });

  const type = req.query.type || null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;

  try {
    const values = [];
    let queryText = `
      SELECT id, title, type
      FROM tests
    `;

    if (type) {
      queryText += "WHERE type = $1 ";
      values.push(type);
    }

    queryText += "ORDER BY created_at DESC ";

    if (limit) {
      queryText += `LIMIT ${limit}`;
    }

    const tests = await query(queryText, values);

    const data = await Promise.all(
      tests.rows.map(async (t) => {
        const [assignedRes, completedRes, viewedRes] = await Promise.all([
          query(`SELECT COUNT(*) FROM test_users WHERE test_id = $1`, [t.id]),
          query(`SELECT COUNT(*) FROM test_users WHERE test_id = $1 AND completed = true`, [t.id]),
          query(`SELECT viewed_by_admin FROM test_users WHERE test_id = $1 LIMIT 1`, [t.id]),
        ]);

        return {
          test_id: t.id,
          title: t.title,
          test_type: t.type,
          assigned: Number(assignedRes.rows[0].count),
          completed: Number(completedRes.rows[0].count),
          viewed_by_admin: viewedRes.rows[0]?.viewed_by_admin || false,
        };
      })
    );

    res.json(data);
  } catch (err) {
    console.error("❌ Ошибка при получении тестов:", err);
    res.status(500).json({ error: "DB error" });
  }
};




export const markTestAsCompleted = async (req, res) => {
  const userId = req.user?.id;
  const testId = req.params.test_id;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    await query(
      `UPDATE test_users SET completed = true, completed_at = NOW()
       WHERE user_id = $1 AND test_id = $2`,
      [userId, testId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Ошибка при обновлении завершения теста:", err);
    res.status(500).json({ error: "DB error" });
  }
};

export const markTestAsViewedByAdmin = async (req, res) => {
  const userId = req.user?.id;
  const isAdmin = req.user?.role === "admin";
  const testId = req.params.test_id;

  if (!userId || !isAdmin) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    await query(
      `UPDATE test_users
       SET viewed_by_admin = TRUE
       WHERE test_id = $1`,
      [testId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Ошибка при отметке теста как просмотренного:", err);
    res.status(500).json({ error: "DB error" });
  }
};

export const getUsersAssignedToTest = async (req, res) => {
  const testId = req.params.test_id;

  try {
    const result = await query(
      `SELECT user_id FROM test_users WHERE test_id = $1`,
      [testId]
    );
    res.json(result.rows); // [{ user_id: 1 }, { user_id: 2 }, ...]
  } catch (err) {
    console.error("❌ Ошибка при получении назначенных пользователей:", err);
    res.status(500).json({ error: "DB error" });
  }
};


export const deleteTestResult = async (req, res) => {
  const userId = req.user?.id;
  const testId = req.params.test_id;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    // Удалим все ответы пользователя на вопросы этого теста
    await query(`
      DELETE FROM answers
      WHERE user_id = $1 AND question_id IN (
        SELECT id FROM questions WHERE test_id = $2
      )
    `, [userId, testId]);

    // Удалим саму запись из test_users
    await query(`
      DELETE FROM test_users
      WHERE user_id = $1 AND test_id = $2
    `, [userId, testId]);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Ошибка при удалении результата теста:", err);
    res.status(500).json({ error: "DB error" });
  }
};
export const getLastCreatedTestsWithStats = async (req, res) => {
  const isAdmin = req.user?.role === "admin";
  if (!isAdmin) return res.status(403).json({ error: "Access denied" });

  try {
    const result = await query(`
      SELECT
        t.id AS test_id,
        t.title,
        t.type AS test_type,
        COUNT(tu.*) FILTER (WHERE tu.test_id IS NOT NULL) AS assigned,
        COUNT(tu.*) FILTER (WHERE tu.completed = true) AS completed,
        MAX(CASE WHEN tu.viewed_by_admin THEN 1 ELSE 0 END) AS viewed_by_admin
      FROM tests t
      LEFT JOIN test_users tu ON tu.test_id = t.id
      GROUP BY t.id
      ORDER BY t.id DESC
      LIMIT 3
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ SQL ошибка:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getLatestAssignedTests = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const result = await query(`
      SELECT
        tu.test_id,
        t.title,
        t.type AS test_type,
        tu.completed,
        tu.viewed_by_admin,
        (
          SELECT COUNT(*) FROM test_users WHERE test_id = tu.test_id
        ) AS assigned
      FROM test_users tu
      JOIN tests t ON t.id = tu.test_id
      WHERE tu.user_id = $1
      ORDER BY tu.id DESC
      LIMIT 3
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Ошибка получения назначенных тестов:", err.message);
    res.status(500).json({ error: err.message });
  }
};
