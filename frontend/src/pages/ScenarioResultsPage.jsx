import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ClickPathPreview from "../components/ClickPathPreview";
import { CognitiveLoadChart } from "../components/CognitiveLoadChart";
import ConfirmModal from "../components/modals/ConfirmModal";

export default function ScenarioResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pdfRef = useRef(null);

  const [tab, setTab] = useState("avg");
  const [summary, setSummary] = useState(null);
  const [details, setDetails] = useState([]);
  const [scenario, setScenario] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3000/api/test_users/viewed/${id}`, {
      method: "PATCH",
      credentials: "include",
    });

    fetch(`http://localhost:3000/api/scenarios/stats/${id}`, {
      credentials: "include",
    }).then((res) => res.json()).then(setSummary);

    fetch(`http://localhost:3000/api/scenarios/results/${id}`, {
      credentials: "include",
    }).then((res) => res.json()).then(setDetails);

    fetch(`http://localhost:3000/api/scenarios/by-test/${id}`)
      .then(res => res.ok ? res.json() : null)
      .then(setScenario);
  }, [id]);

  const maxDur = Math.max(...details.map((u) => u.duration || 0), 1);
  const maxClicks = Math.max(...details.map((u) => u.click_count || 0), 1);
  const maxErrors = Math.max(...details.map((u) => u.error_count || 0), 1);

  const normalizePath = (path) =>
    path.map((p) => ({
      x: Math.round(p.x / 10) * 10,
      y: Math.round(p.y / 10) * 10,
    }));

  const allPaths = details.map((u) => {
    const raw = typeof u.path_data === "string" ? JSON.parse(u.path_data) : u.path_data || [];
    return normalizePath(raw);
  });

  const idealPath = (() => {
    const stepsByIndex = {};
    allPaths.forEach((path) => {
      path.forEach((p, i) => {
        const key = `${p.x},${p.y}`;
        stepsByIndex[i] = stepsByIndex[i] || {};
        stepsByIndex[i][key] = (stepsByIndex[i][key] || 0) + 1;
      });
    });

    const ideal = [];
    for (const i in stepsByIndex) {
      const entries = Object.entries(stepsByIndex[i]);
      if (entries.length === 0) continue;
      const [x, y] = entries.sort((a, b) => b[1] - a[1])[0][0].split(",").map(Number);
      ideal.push({ x, y });
    }

    return ideal;
  })();

  const comparePaths = (userPath) => {
    const minLen = Math.min(userPath.length, idealPath.length);
    let match = 0;
    for (let i = 0; i < minLen; i++) {
      if (userPath[i].x === idealPath[i].x && userPath[i].y === idealPath[i].y) {
        match++;
      }
    }
    return Math.round((match / idealPath.length) * 100);
  };

  const handleDeleteResult = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/scenarios/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
  
      if (res.ok) {
        navigate("/");
      } else {
        const errorData = await res.json();
        alert("Ошибка при удалении сценария: " + (errorData?.error || "Неизвестная ошибка"));
      }
    } catch (err) {
      console.error("Ошибка удаления:", err);
      alert("Ошибка при удалении сценария (fetch упал)");
    }
  };
  
  

  const handleExportPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;

    const opt = {
      margin: 0.5,
      filename: `scenario-results-${id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().from(pdfRef.current).set(opt).save();
  };

  return (
    <main className="scenario-results page" ref={pdfRef}>
      <div className="scenario-results__tabs tabs">
        <button
          className={`scenario-results__tab tab font-base tab ${tab === "avg" ? "scenario-results__tab--active tab-active" : ""}`}
          onClick={() => setTab("avg")}
        >
          Средние
        </button>
        <button
          className={`scenario-results__tab tab font-base tab ${tab === "details" ? "scenario-results__tab--active tab-active" : ""}`}
          onClick={() => setTab("details")}
        >
          Подробные
        </button>
      </div>

      <div className="scenario-results__header">
        <span className="scenario-results__count font-md">{details.length} участника</span>
      </div>

      {tab === "avg" && summary && (
        <section className="assign__list assign__list--summary">
          <div className="scenario-result__header assign__list-header font-base" role="row">
            <span>Группа</span>
            <span>Время</span>
            <span>Клики</span>
            <span>Ошибки</span>
            <span>Попытки</span>
          </div>

          <ul className="assign__list-body">
            <li className="assign__list-row font-base" role="row">
              <span>{summary.title}</span>
              <span>{summary.avg_duration}</span>
              <span>{summary.avg_clicks}</span>
              <span>{summary.avg_errors}</span>
              <span>{summary.total_attempts}</span>
            </li>
          </ul>
        </section>
      )}




      {tab === "details" && (
        <>
          <CognitiveLoadChart data={details} />

          <section className="scenario-results__routes">
            <h3 className="scenario-results__subheading font-md">Маршруты участников</h3>

            {details.map((user, idx) => {
              const path =
                typeof user.path_data === "string"
                  ? JSON.parse(user.path_data)
                  : user.path_data || [];

              const normDur = user.duration / maxDur;
              const normClicks = user.click_count / maxClicks;
              const normErrors = user.error_count / maxErrors;
              const score = normDur + normClicks + normErrors;
              const clScore = score / 3;

              const level =
                score < 1.5 ? "низкая" :
                score < 2.2 ? "средняя" : "высокая";

              const matchPercent = comparePaths(normalizePath(path));
              const matchColor =
                matchPercent >= 90 ? "green" :
                matchPercent >= 60 ? "orange" : "red";

              const expectedSteps = scenario?.steps?.length || user.step + 1;
              const extraClicks = path.length - expectedSteps;

              return (
                <article key={idx} className="scenario-results__user-block">
                  <h4 className="scenario-results__user-name font-base">
                    {user.first_name}, {user.age} лет
                  </h4>

                  <ClickPathPreview
                    pathData={path}
                    imageUrl={user.environment_url}
                  />

                  <div className="scenario-results__metrics font-base">
                    <span className={`load-label load-label--${level}`}>
                      Нагрузка: {level}
                    </span>
                    <span style={{ color: matchColor }}>
                      Совпадение: {matchPercent}%
                    </span>
                    <span>Время: {user.duration} сек</span>
                    <span>Клики: {user.click_count}</span>
                    <span>Ошибки: {user.error_count}</span>
                    <span>Лишние клики: {extraClicks > 0 ? extraClicks : 0}</span>
                  </div>

                  <div className="cl-bar">
                    <div className="cl-bar__fill" style={{ width: `${clScore * 100}%` }} />
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}

      <div className="scenario-results__actions ab-results__actions">
        <button
          className="scenario-results__button delete-button font-base"
          onClick={() => setShowConfirmModal(true)}
        >
          <img src="/icon/delete-color.svg" alt="" /> Удалить
        </button>
        <button
          onClick={handleExportPDF}
          className="scenario-results__button scenario-results__button--export save__button font-base"
        >
          Экспортировать в pdf
        </button>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={handleDeleteResult}
        onCancel={() => setShowConfirmModal(false)}
        message="Вы уверены, что хотите удалить результат прохождения сценарного теста?"
      />
    </main>
  );
}
