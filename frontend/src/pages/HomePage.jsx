import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function HomePage() {
  const [tests, setTests] = useState([]);
  const [reload, setReload] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    const url =
      user.role === "admin"
        ? "http://localhost:3000/api/test_users/created"
        : "http://localhost:3000/api/test_users/latest";

    fetch(url, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTests(data);
        else setTests([]);
      })
      .catch((err) => {
        console.error("Ошибка загрузки тестов:", err);
        setTests([]);
      });
  }, [user, reload]);

  useEffect(() => {
    const onFocus = () => setReload((r) => !r);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const handleClick = (test) => {
    const path =
      test.test_type === "ab"
        ? `/ab-results/${test.test_id}`
        : `/scenario-results/${test.test_id}`;
    navigate(path);
  };

  const handleDelete = (e, testId) => {
    e.stopPropagation();
    console.log("Удалить тест:", testId);
  };

  const getStatus = (test) => {
    if (test.viewed_by_admin) return "Просмотрено";
    if (test.completed >= test.assigned) return "Завершено";
    return "В процессе";
  };

  const goToRunner = (test) => {
    const path =
      test.test_type === "ab"
        ? `/ab-runner/${test.test_id}`
        : `/hotspot/${test.test_id}`;
    navigate(path);
  };

  return (
    <div className="home-page page">
      <div className="home-page__list">
        {Array.isArray(tests) &&
          tests.map((test) => {
            const isAdmin = user?.role === "admin";
            const status = getStatus(test);

            return (
              <div
                key={test.test_id}
                className="test-card big-border-radius border-base"
                onClick={isAdmin ? () => handleClick(test) : undefined}
                style={{ cursor: isAdmin ? "pointer" : "default" }}
              >
                <div className="test-card__info">
                  <div className="test-card__badge badge">
                    {test.test_type === "ab" ? "A/B тест" : "Сценарий"}
                  </div>
                  <p className="test-card__title font-md">{test.title}</p>
                </div>

                <div className="test-card__status-wrap">
                  {isAdmin ? (
                    <>
                      <span
                        className={`test-card__status test-card__status--${status.toLowerCase()}`}
                      >
                        {status}
                      </span>

                      {status === "Просмотрено" && (
                        <button
                          className="test-card__delete"
                          title="Удалить"
                          onClick={(e) => handleDelete(e, test.test_id)}
                        >
                          <img src="icon/delete.svg" alt="" />
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      className="test-card__button test-card__button--start"
                      onClick={() => goToRunner(test)}
                    >
                      Приступить
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
