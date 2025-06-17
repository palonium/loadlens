import { PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#d9534f", "#f0ad4e", "#5cb85c"];

export function CognitiveLoadChart({ data }) {
  const counts = { высокая: 0, средняя: 0, низкая: 0 };

  data.forEach((user) => {
    const normDur = user.duration / Math.max(...data.map(u => u.duration || 0), 1);
    const normClicks = user.click_count / Math.max(...data.map(u => u.click_count || 0), 1);
    const normErrors = user.error_count / Math.max(...data.map(u => u.error_count || 0), 1);
    const score = normDur + normClicks + normErrors;

    const level =
      score < 1.5 ? "низкая" : score < 2.2 ? "средняя" : "высокая";

    counts[level]++;
  });

  const chartData = Object.keys(counts).map((key) => ({
    name: key[0].toUpperCase() + key.slice(1),
    value: counts[key],
  }));

  return (
    <div style={{ width: 300, marginBottom: "2rem" }}>
      <PieChart width={300} height={200}>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={70}
          label
          dataKey="value"
        >
          {chartData.map((_, i) => (
            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </div>
  );
}
