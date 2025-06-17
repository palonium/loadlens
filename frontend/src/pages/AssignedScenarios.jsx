import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AssignedScenarios() {
  const [assignedTests, setAssignedTests] = useState([]);
  const [activeTab, setActiveTab] = useState("scenario");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/api/test_users/me", {
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => setAssignedTests(data));
  }, []);

  const filteredTests = assignedTests.filter(
    (t) => t.test_type === activeTab && !t.completed
  );

  const goToRunner = (test) => {
    const path =
      test.test_type === "ab"
        ? `/ab-runner/${test.test_id}`
        : `/hotspot/${test.test_id}`;
    navigate(path);
  };

  return (
    <div className="assigned-tests page">
      <div className="assigned-tests__tabs tabs">
        <button
          className={`tab font-base ${activeTab === "scenario" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("scenario")}
        >
          Сценарии
        </button>
        <button
          className={`tab font-base ${activeTab === "ab" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("ab")}
        >
          A/B тесты
        </button>
      </div>

      {filteredTests.length === 0 ? (
        <p className="font-base base-color-text">Нет доступных тестов для прохождения.</p>
      ) : (
        <div className="home-page__list">
          {filteredTests.map((test) => (
            <div
              key={test.test_id}
              className="test-card big-border-radius border-base"
            >
              <div className="test-card__info">
                <div className="test-card__badge badge">
                  {test.test_type === "ab" ? "A/B тест" : "Сценарий"}
                </div>
                <p className="test-card__title font-md">{test.title}</p>
              </div>

              <div className="test-card__status-wrap">
                <button
                  className="test-card__button test-card__button--start"
                  onClick={() => goToRunner(test)}
                >
                  Приступить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
