import { useState, useEffect } from "react";

export default function ResultsTable() {
  const [tab, setTab] = useState("user"); // user | stats | ab | abstats
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState([]);
  const [abResults, setAbResults] = useState([]);
  const [abStats, setAbStats] = useState([]);

  useEffect(() => {
    if (tab === "user") {
      fetch("http://localhost:3000/api/scenarios/results", { credentials: "include" })
        .then(res => res.json())
        .then(setResults);
    } else if (tab === "stats") {
      fetch("http://localhost:3000/api/scenarios/stats", { credentials: "include" })
        .then(res => res.json())
        .then(setStats);
    } else if (tab === "ab") {
      fetch("http://localhost:3000/api/ab/results", { credentials: "include" })
        .then(res => res.json())
        .then(setAbResults);
    } else if (tab === "abstats") {
      fetch("http://localhost:3000/api/ab/stats", { credentials: "include" })
        .then(res => res.json())
        .then(setAbStats);
    }
  }, [tab]);

  const getStepDurations = (pathData) => {
    try {
      const clicks = JSON.parse(pathData);
      const stepMap = new Map();
      clicks.forEach((click) => {
        if (!click.hit) return;
        stepMap.set(click.step, click.duration);
      });
      return Array.from(stepMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([step, duration]) => `Шаг ${step + 1}: ${duration}с`)
        .join(", ");
    } catch (err) {
      return "Ошибка данных";
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📈 Анализ результатов</h2>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setTab("user")}>📋 Сценарии (пользователи)</button>
        <button onClick={() => setTab("stats")}>📊 Сценарии (статистика)</button>
        <button onClick={() => setTab("ab")}>🧪 A/B тесты (ответы)</button>
        <button onClick={() => setTab("abstats")}>📊 A/B статистика</button>
      </div>

      {tab === "user" && (
        <table>
          <thead>
            <tr>
              <th>Пользователь</th><th>Email</th><th>Сценарий</th><th>Время</th><th>Клики</th><th>Ошибки</th><th>Шаги</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr key={r.id}>
                <td>{r.first_name}</td><td>{r.email}</td><td>{r.task_text}</td>
                <td>{r.duration}</td><td>{r.click_count}</td><td>{r.error_count}</td>
                <td>{getStepDurations(r.path_data)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "stats" && (
        <table>
          <thead>
            <tr>
              <th>Сценарий</th><th>Среднее время</th><th>Клики</th><th>Ошибки</th><th>Попыток</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(s => (
              <tr key={s.scenario_id}>
                <td>{s.task_text}</td><td>{s.avg_duration}</td><td>{s.avg_clicks}</td>
                <td>{s.avg_errors}</td><td>{s.total_attempts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "ab" && (
        <table>
          <thead>
            <tr>
              <th>Пользователь</th><th>Email</th><th>Вопрос</th><th>Выбор</th><th>⏱ Время (сек)</th>
            </tr>
          </thead>
          <tbody>
            {abResults.map((r, i) => (
              <tr key={i}>
                <td>{r.first_name}</td><td>{r.email}</td><td>{r.task_text}</td>
                <td>{r.selected_image}</td><td>{r.answer_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "abstats" && (
        <table>
          <thead>
            <tr>
              <th>Вопрос</th><th>А выбрали</th><th>Б выбрали</th><th>Всего</th><th>Среднее время</th>
            </tr>
          </thead>
          <tbody>
            {abStats.map((s, i) => (
              <tr key={i}>
                <td>{s.task_text}</td><td>{s.count_a}</td><td>{s.count_b}</td>
                <td>{s.total_answers}</td><td>{s.avg_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
