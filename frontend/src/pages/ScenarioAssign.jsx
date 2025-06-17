import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

// 🔧 Склонение слова "участник"
function pluralize(count, one, few, many) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export default function ScenarioAssign() {
  const { id: scenarioId } = useParams();
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [sortBy, setSortBy] = useState("age-asc");
  const [sortOpen, setSortOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const sortRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/users")
      .then(res => res.json())
      .then(setUsers);

    fetch("http://localhost:3000/api/scenarios/by-test/" + scenarioId)
      .then(res => res.json())
      .then(data => console.log("Сценарий:", data));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSelect = (userId) => {
    setSelected((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAssign = async () => {
    if (selected.length === 0) {
      setHasError(true);
      return;
    }

    setHasError(false); // сброс ошибки

    const res = await fetch("http://localhost:3000/api/test_users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        test_id: scenarioId,
        user_ids: selected
      })
    });

    if (res.ok) {
      alert("Сценарий назначен выбранным пользователям!");
    } else {
      alert("Ошибка при назначении.");
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    switch (sortBy) {
      case "age-asc": return a.age - b.age;
      case "age-desc": return b.age - a.age;
      case "assigned-asc": return (a.assigned || 0) - (b.assigned || 0);
      case "assigned-desc": return (b.assigned || 0) - (a.assigned || 0);
      case "completed-asc": return (a.completed || 0) - (b.completed || 0);
      case "completed-desc": return (b.completed || 0) - (a.completed || 0);
      default: return 0;
    }
  });

  return (
    <div className="assign page">
      <label className="assign__label font-base">
        Введите название фокус-группы
        <input
          type="text"
          className="assign__input input base-border-radius"
          placeholder="Сайт аренды домов"
        />
      </label>

      <p className="assign__title font-md">Выберите пользователей</p>

      <div className="assign__header">
        <p className="assign__subtitle">
          {users.length} {pluralize(users.length, "участник", "участника", "участников")}
        </p>

        <div className="assign__sort" ref={sortRef}>
          <button className="assign__sort-button" onClick={() => setSortOpen(!sortOpen)}>
            Сортировать <img src="/icon/arrow-dropdown.svg" className="assign__sort-icon" />
          </button>

          {sortOpen && (
            <div className="assign__sort-menu">
              <div onClick={() => setSortBy("age-asc")}>Возраст (по возрастанию)</div>
              <div onClick={() => setSortBy("age-desc")}>Возраст (по убыванию)</div>
              <div onClick={() => setSortBy("assigned-asc")}>Назначено (по возрастанию)</div>
              <div onClick={() => setSortBy("assigned-desc")}>Назначено (по убыванию)</div>
              <div onClick={() => setSortBy("completed-asc")}>Пройдено (по возрастанию)</div>
              <div onClick={() => setSortBy("completed-desc")}>Пройдено (по убыванию)</div>
            </div>
          )}
        </div>
      </div>

      <section className="assign__list" aria-label="Список пользователей">
        <div className="assign__list-header" role="row">
          <span>Имя</span>
          <span>Возраст</span>
          <span>Пройдено</span>
          <span>Назначено</span>
          <span>Не пройдено</span>
          <span>Добавить</span>
        </div>

        <ul className="assign__list-body">
          {sortedUsers.map(user => {
            const isSelected = selected.includes(user.id);
            const completed = user.completed || 0;
            const assigned = user.assigned || 0;
            const uncompleted = Math.max(assigned - completed, 0);

            return (
              <li key={user.id} className="assign__list-row font-base" role="row">
                <span className="assign__user">
                  {user.first_name} {user.last_name}
                </span>
                <span>{user.age}</span>
                <span>{completed}</span>
                <span>{assigned}</span>
                <span>{uncompleted}</span>
                <span>
                  <button
                    className="assign__toggle"
                    onClick={() => toggleSelect(user.id)}
                    aria-label={isSelected ? "Убрать пользователя" : "Добавить пользователя"}
                  >
                    {isSelected ? (
                      <img src="/icon/delete-minus.svg" className="assign__togle-icon" />
                    ) : (
                      <img src="/icon/add.svg" className="assign__togle-icon" />
                    )}
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <button onClick={handleAssign} className="assign__submit save__button font-base">
        Создать
      </button>

      {hasError && (
        <p className="assign__error error font-base">
          Пожалуйста, выберите хотя бы одного пользователя.
        </p>
      )}
    </div>
  );
}
