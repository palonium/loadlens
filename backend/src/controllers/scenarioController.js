import { query, pool } from "../db.js";

export const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Файл не загружен" });
  }
  res.json({ imageUrl: `/uploads/${req.file.filename}` }); // 🔴 обязательно res.json
};


export const saveScenario = async (req, res) => {
  const { task_text, image_url, steps } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const testRes = await client.query(
      `INSERT INTO tests (title, type, created_by)
       VALUES ($1, 'scenario', $2) RETURNING id`,
       [task_text.slice(0, 100), req.user?.id || null]
    );
    const testId = testRes.rows[0].id;

    const scenarioRes = await client.query(
      `INSERT INTO scenarios (test_id, task_text, environment_url, title)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [testId, task_text, image_url, req.body.title]
    );
    
    const scenarioId = scenarioRes.rows[0].id;

    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      await client.query(
        `INSERT INTO scenario_steps (scenario_id, step_order, x, y, width, height, label)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [scenarioId, i, s.x, s.y, s.width, s.height, s.label]
      );
    }

    await client.query("COMMIT");

    // 🔍 Лог для контроля
    console.log("🧪 Сохранили сценарий:", { scenario_id: scenarioId, test_id: testId });

    // 🔴 ВАЖНО: это и есть ответ, который должен прийти на фронт
    res.json({ scenario_id: scenarioId, test_id: testId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Ошибка при сохранении сценария:", err);
    res.status(500).json({ error: "DB error" });
  } finally {
    client.release();
  }
};

export const saveScenarioResult = async (req, res) => {
  const userId = req.user.id;
  const scenarioId = req.params.scenario_id;
  const { duration, clicks, errorCount } = req.body;

  try {
    const clickCount = clicks.length;
    const pathData = JSON.stringify(clicks);

    // 1. Сохраняем клик-путь
    await query(
      `INSERT INTO scenario_clicks (user_id, scenario_id, click_count, error_count, path_data, duration)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, scenarioId, clickCount, errorCount, pathData, duration]
    );

    // 2. Обновляем статус "completed" в test_users
    await query(
      `UPDATE test_users
       SET completed = true
       WHERE user_id = $1 AND test_id = (
         SELECT test_id FROM scenarios WHERE id = $2
       )`,
      [userId, scenarioId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Ошибка сохранения результата:", err);
    res.status(500).json({ error: "DB error" });
  }
};



export const getScenario = async (req, res) => {
  const id = req.params.id;

  const scenarioRes = await query(`SELECT * FROM scenarios WHERE id = $1`, [id]);
  if (scenarioRes.rows.length === 0) return res.status(404).json({ error: "Not found" });

  const stepsRes = await query(
    `SELECT step_order, x, y, width, height, label
     FROM scenario_steps WHERE scenario_id = $1 ORDER BY step_order ASC`,
    [id]
  );

  res.json({
    ...scenarioRes.rows[0],
    steps: stepsRes.rows
  });
};


export const getScenarioByTestId = async (req, res) => {
  const testId = req.params.test_id;

  const scenarioRes = await query(`SELECT * FROM scenarios WHERE test_id = $1`, [testId]);
  if (scenarioRes.rows.length === 0) return res.status(404).json({ error: "Not found" });

  const scenarioId = scenarioRes.rows[0].id;

  const stepsRes = await query(
    `SELECT step_order, x, y, width, height, label
     FROM scenario_steps WHERE scenario_id = $1 ORDER BY step_order ASC`,
    [scenarioId]
  );

  res.json({
    ...scenarioRes.rows[0],
    steps: stepsRes.rows
  });
};

export const getScenarioResults = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        sc.id,
        sc.scenario_id,
        u.id AS user_id,
        u.first_name,
        u.email,
        s.task_text,
        sc.duration,
        sc.click_count,
        sc.error_count,
        sc.path_data,
        sc.completed_at
      FROM scenario_clicks sc
      JOIN users u ON sc.user_id = u.id
      JOIN scenarios s ON sc.scenario_id = s.id
      ORDER BY sc.completed_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Ошибка при получении результатов:", err);
    res.status(500).json({ error: "DB error" });
  }
};

export const getScenarioStats = async (req, res) => {
  try {
    const result = await query(`
      SELECT
        s.task_text,
        s.id AS scenario_id,
        COUNT(sc.id) AS total_attempts,
        ROUND(AVG(sc.duration)::numeric, 1) AS avg_duration,
        ROUND(AVG(sc.error_count)::numeric, 1) AS avg_errors,
        ROUND(AVG(sc.click_count)::numeric, 1) AS avg_clicks
      FROM scenario_clicks sc
      JOIN scenarios s ON sc.scenario_id = s.id
      GROUP BY s.id
      ORDER BY s.id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Ошибка при подсчёте статистики:", err);
    res.status(500).json({ error: "DB error" });
  }
};


export const getScenarioResultsByTest = async (req, res) => {
  const testId = req.params.id;

  try {
    const result = await query(
      `SELECT sc.*, u.first_name, u.age, s.task_text, s.environment_url
       FROM scenario_clicks sc
       JOIN users u ON sc.user_id = u.id
       JOIN scenarios s ON sc.scenario_id = s.id
       WHERE s.test_id = $1`,
      [testId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Ошибка при получении результатов сценариев:", err);
    res.status(500).json({ error: "DB error" });
  }
};

export const getScenarioStatsByTest = async (req, res) => {
  const testId = req.params.id;

  try {
    const result = await query(
      `SELECT
         t.title,
         ROUND(AVG(sc.duration), 0) AS avg_duration,
         ROUND(AVG(sc.click_count), 1) AS avg_clicks,
         ROUND(AVG(sc.error_count), 1) AS avg_errors,
         COUNT(*) AS total_attempts
       FROM scenario_clicks sc
       JOIN scenarios s ON sc.scenario_id = s.id
       JOIN tests t ON s.test_id = t.id
       WHERE s.test_id = $1
       GROUP BY t.title`,
      [testId]
    );

    res.json(result.rows[0] || {});
  } catch (err) {
    console.error("❌ Ошибка при получении статистики сценариев:", err);
    res.status(500).json({ error: "DB error" });
  }
};

export const deleteScenarioResult = async (req, res) => {
  const userId = req.user?.id;
  const testId = req.params.test_id;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    // Найдём сценарии по testId
    const result = await query(`SELECT id FROM scenarios WHERE test_id = $1`, [testId]);
    const scenarioIds = result.rows.map(row => row.id);

    if (scenarioIds.length === 0) return res.status(404).json({ error: "Сценарии не найдены" });

    // Удалим клики пользователя по этим сценариям
    await query(`
      DELETE FROM scenario_clicks
      WHERE user_id = $1 AND scenario_id = ANY($2)
    `, [userId, scenarioIds]);

    // Удалим назначение теста
    await query(`
      DELETE FROM test_users
      WHERE user_id = $1 AND test_id = $2
    `, [userId, testId]);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Ошибка при удалении результатов сценария:", err);
    res.status(500).json({ error: "DB error" });
  }
};

export const deleteScenarioCompletely = async (req, res) => {
  const userId = req.user?.id;
  const testId = req.params.test_id;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(`SELECT id FROM scenarios WHERE test_id = $1`, [testId]);
    const scenarioIds = result.rows.map(r => r.id);

    if (scenarioIds.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Сценарии не найдены" });
    }

    await client.query(`DELETE FROM scenario_clicks WHERE scenario_id = ANY($1)`, [scenarioIds]);
    await client.query(`DELETE FROM scenario_steps WHERE scenario_id = ANY($1)`, [scenarioIds]);
    await client.query(`DELETE FROM scenarios WHERE id = ANY($1)`, [scenarioIds]);
    await client.query(`DELETE FROM test_users WHERE test_id = $1`, [testId]);
    await client.query(`DELETE FROM tests WHERE id = $1`, [testId]);

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Ошибка при полном удалении сценария:", err);
    res.status(500).json({ error: "DB error" });
  } finally {
    client.release();
  }
};

