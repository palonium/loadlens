import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/modals/ConfirmModal";

export default function GroupListPage() {
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/api/test_users/tests", { credentials: "include" })
      .then((res) => res.json())
      .then(setGroups);
  }, []);

  const handleDeleteClick = (group) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!selectedGroup) return;

    const res = await fetch(`http://localhost:3000/api/tests/${selectedGroup.test_id}`, {
      method: "DELETE",
      credentials: "include"
    });

    if (res.ok) {
      setGroups((prev) => prev.filter((g) => g.test_id !== selectedGroup.test_id));
    } else {
      alert("Ошибка при удалении группы");
    }

    setIsModalOpen(false);
    setSelectedGroup(null);
  };

  return (
    <div className="results-overview page">

      <div className="results-overview__list home-page__list">
        {groups.map((group) => {
          const percent = group.assigned > 0
            ? Math.round((group.completed / group.assigned) * 100)
            : 0;

          const status = group.completed >= group.assigned ? "Завершено" : "В процессе";

          return (
            <div
              key={group.test_id}
              className="test-card big-border-radius border-base cursor"
              onClick={() => navigate(`/assign/${group.test_id}`)}
            >
              <div className="test-card__info">
                <div className="test-card__badge badge">
                  {group.test_type === "ab" ? "A/B тест" : "Сценарий"}
                </div>
                <p className="test-card__title font-md">{group.title}</p>
              </div>

              <div className="test-card__status-wrap">
                <span className={`test-card__status test-card__status--${status.toLowerCase()}`}>
                  {status} {status === "В процессе" && <span className="test-card__percent">({percent}%)</span>}
                </span>
                <button
                  className="test-card__delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(group);
                  }}
                >
                  <img src="/icon/delete-color.svg" alt="Удалить" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setIsModalOpen(false)}
        message="Вы действительно хотите удалить эту группу и всех назначенных пользователей?"
      />
    </div>
  );
}
