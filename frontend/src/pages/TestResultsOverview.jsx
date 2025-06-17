import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TestResultsOverview() {
  const [tab, setTab] = useState("scenario");
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:3000/api/test_users/tests?type=${tab}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setTests);
  }, [tab]);

  const getStatus = (test) => {
    if (test.viewed_by_admin) return "Просмотрено";
    if (test.completed >= test.assigned) return "Завершено";
    return "В процессе";
  };

  return (
    <div className="results-overview page">
      <div className="results-overview__tabs tabs">
        <button
          className={`results-overview__tab tab font-base tab ${
            tab === "scenario" ? "results-overview__tab--active tab-active" : ""
          }`}
          onClick={() => setTab("scenario")}
        >
          Сценарии
        </button>
        <button
          className={`results-overview__tab font-base tab ${
            tab === "ab" ? "results-overview__tab--active tab-active" : ""
          }`}
          onClick={() => setTab("ab")}
        >
          A/B тесты
        </button>
      </div>

      <div className="results-overview__list home-page__list">
        {tests.map((test) => {
          const percent =
            test.assigned > 0
              ? Math.round((test.completed / test.assigned) * 100)
              : 0;

          const status = getStatus(test);

          return (
            <div
              key={test.test_id}
              className="test-card big-border-radius border-base cursor"
              onClick={() => {
                const route = tab === "ab" ? "/ab-results/" : "/scenario-results/";
                navigate(`${route}${test.test_id}`);
              }}
            >
              <div className="test-card__info">
                <div className="test-card__badge badge">
                  {tab === "ab" ? "A/B тест" : "Сценарий"}
                </div>
                <p className="test-card__title font-md">{test.title}</p>
              </div>

              <div className="test-card__status-wrap">
                <span
                  className={`test-card__status test-card__status--${status.toLowerCase()}`}
                >
                  {status}{" "}
                  {status !== "Завершено" && status !== "Просмотрено" && (
                    <span className="test-card__percent">({percent}%)</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
