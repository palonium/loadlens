import { useEffect, useState } from "react";

export default function ScenarioStats() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/scenarios/stats", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(setStats);
  }, []);

  return (
    <div className="scenario-stats" style={{ padding: "2rem" }}>
      <h2>📊 Обобщённая статистика по сценариям</h2>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>Название сценария</th>
            <th>Среднее время (сек)</th>
            <th>Средние клики</th>
            <th>Средние ошибки</th>
            <th>Попыток</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s) => (
            <tr key={s.scenario_id}>
              <td>{s.task_text}</td>
              <td>{s.avg_duration}</td>
              <td>{s.avg_clicks}</td>
              <td>{s.avg_errors}</td>
              <td>{s.total_attempts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
