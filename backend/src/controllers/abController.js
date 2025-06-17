import { query } from "../db.js";

export const createAbTest = async (req, res) => {
  const { title, description, questions } = req.body;
  const createdBy = req.user?.id || null;

  const client = await query.connect?.() || { query };

  try {
    await client.query("BEGIN");

    const testRes = await client.query(
      `INSERT INTO tests (title, description, type, created_by)
       VALUES ($1, $2, 'ab', $3) RETURNING id`,
      [title, description, createdBy]
    );
    const testId = testRes.rows[0].id;

    for (let q of questions) {
      const qRes = await client.query(
        `INSERT INTO questions (test_id, task_text)
         VALUES ($1, $2) RETURNING id`,
        [testId, q.task_text]
      );

      const questionId = qRes.rows[0].id;

      for (let img of q.images) {
        await client.query(
          `INSERT INTO question_images (question_id, image_type, image_url)
           VALUES ($1, $2, $3)`,
          [questionId, img.image_type, img.image_url]
        );
      }
    }

    await client.query("COMMIT");
    res.json({ success: true, test_id: testId });
  } catch (err) {
    await client.query?.("ROLLBACK");
    console.error("❌ Ошибка при создании A/B теста:", err);
    res.status(500).json({ error: "DB error" });
  } finally {
    client.release?.();
  }
};

export const getQuestionsByTest = async (req, res) => {
  const testId = req.params.test_id;

  try {
    const qRes = await query(
      `SELECT * FROM questions WHERE test_id = $1 ORDER BY id`,
      [testId]
    );

    const questions = qRes.rows;

    for (let q of questions) {
      const iRes = await query(
        `SELECT image_type, image_url FROM question_images WHERE question_id = $1 ORDER BY image_type`,
        [q.id]
      );
      q.images = iRes.rows;
    }

    res.json(questions);
  } catch (err) {
    console.error("❌ Ошибка при загрузке вопросов A/B теста:", err);
    res.status(500).json({ error: "DB error" });
  }
};

export const getAbResults = async (req, res) => {
  try {
    const result = await query(
      `SELECT a.*, u.first_name, u.email, q.task_text
       FROM answers a
       JOIN users u ON a.user_id = u.id
       JOIN questions q ON a.question_id = q.id
       ORDER BY a.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Ошибка при получении A/B результатов:", err);
    res.status(500).json({ error: "DB error" });
  }
};

export const getAbStats = async (req, res) => {
  const testId = req.params.id;

  try {
    const testMeta = await query(`SELECT title, description FROM tests WHERE id = $1`, [testId]);

    const result = await query(
      `SELECT
        q.id AS question_id,
        q.task_text,
        COUNT(*) AS total_answers,
        COUNT(CASE WHEN a.selected_image = 'A' THEN 1 END) AS count_a,
        COUNT(CASE WHEN a.selected_image = 'B' THEN 1 END) AS count_b,
        ROUND(AVG(a.answer_time), 1) AS avg_time,
        MAX(qa.image_url) FILTER (WHERE qa.image_type = 'A') AS image_a,
        MAX(qa.image_url) FILTER (WHERE qa.image_type = 'B') AS image_b
       FROM answers a
       JOIN questions q ON a.question_id = q.id
       JOIN question_images qa ON q.id = qa.question_id
       WHERE q.test_id = $1
       GROUP BY q.id, q.task_text
       ORDER BY q.id`,
      [testId]
    );

    res.json({
      title: testMeta.rows[0]?.title || "",
      description: testMeta.rows[0]?.description || "",
      rows: result.rows,
    });
  } catch (err) {
    console.error("❌ Ошибка при получении A/B статистики:", err);
    res.status(500).json({ error: "DB error" });
  }
};


export const saveAbAnswer = async (req, res) => {
  const { question_id, selected_image, answer_time } = req.body;
  const user_id = req.user?.id;

  if (!user_id || !question_id || !selected_image) {
    return res.status(400).json({ error: "Недостаточно данных для сохранения ответа" });
  }

  try {
    await query(
      `INSERT INTO answers (user_id, question_id, selected_image, answer_time)
       VALUES ($1, $2, $3, $4)`,
      [user_id, question_id, selected_image, answer_time]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Ошибка при сохранении A/B ответа:", err);
    res.status(500).json({ error: "Ошибка базы данных" });
  }
};


export const getAbResultsByTest = async (req, res) => {
  const testId = req.params.id;

  try {
    const result = await query(`
      SELECT
        a.*,
        u.first_name,
        u.email,
        q.task_text,
        qi.image_url
      FROM answers a
      JOIN users u ON a.user_id = u.id
      JOIN questions q ON a.question_id = q.id
      JOIN question_images qi
        ON qi.question_id = q.id AND qi.image_type = a.selected_image
      WHERE q.test_id = $1
      ORDER BY a.created_at DESC
    `, [testId]);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Ошибка при получении результатов A/B по тесту:", err);
    res.status(500).json({ error: "DB error" });
  }
};


export const getAbStatsByTest = async (req, res) => {
  const testId = req.params.id;

  try {
    const testMeta = await query(`SELECT title, description FROM tests WHERE id = $1`, [testId]);

    const result = await query(`
      SELECT
        q.id AS question_id,
        q.task_text,
        MAX(CASE WHEN qi.image_type = 'A' THEN qi.image_url END) AS image_a,
        MAX(CASE WHEN qi.image_type = 'B' THEN qi.image_url END) AS image_b,
        COUNT(a.*) AS total_answers,
        COUNT(CASE WHEN a.selected_image = 'A' THEN 1 END) AS count_a,
        COUNT(CASE WHEN a.selected_image = 'B' THEN 1 END) AS count_b,
        ROUND(AVG(a.answer_time), 1) AS avg_time
      FROM questions q
      LEFT JOIN question_images qi ON qi.question_id = q.id
      LEFT JOIN answers a ON a.question_id = q.id
      WHERE q.test_id = $1
      GROUP BY q.id, q.task_text
      ORDER BY q.id
    `, [testId]);

    res.json({
      title: testMeta.rows[0]?.title || "",
      description: testMeta.rows[0]?.description || "",
      rows: result.rows,
    });
  } catch (err) {
    console.error("❌ Ошибка при получении A/B статистики:", err);
    res.status(500).json({ error: "DB error" });
  }
};

export const deleteAbTest = async (req, res) => {
  const testId = req.params.test_id;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const client = await query.connect?.() || { query, release: () => {} };

  try {
    await client.query("BEGIN");

    // Получаем все вопросы теста
    const questionRes = await client.query(`SELECT id FROM questions WHERE test_id = $1`, [testId]);
    const questionIds = questionRes.rows.map(row => row.id);

    if (questionIds.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Вопросы не найдены" });
    }

    // Удаляем ответы
    await client.query(`DELETE FROM answers WHERE question_id = ANY($1)`, [questionIds]);

    // Удаляем изображения
    await client.query(`DELETE FROM question_images WHERE question_id = ANY($1)`, [questionIds]);

    // Удаляем вопросы
    await client.query(`DELETE FROM questions WHERE id = ANY($1)`, [questionIds]);

    // Удаляем назначения пользователей
    await client.query(`DELETE FROM test_users WHERE test_id = $1`, [testId]);

    // Удаляем сам тест
    await client.query(`DELETE FROM tests WHERE id = $1`, [testId]);

    await client.query("COMMIT");

    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Ошибка при удалении A/B теста:", err);
    res.status(500).json({ error: "DB error" });
  } finally {
    client.release?.();
  }
};
