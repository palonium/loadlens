import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

function pluralize(count, one, few, many) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export default function AssignUsersToTest() {
  const { id: test_id } = useParams();
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [sortBy, setSortBy] = useState("age-asc");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const [usersRes, assignedRes] = await Promise.all([
        fetch("http://localhost:3000/api/users", { credentials: "include" }),
        fetch(`http://localhost:3000/api/test_users/${test_id}`, { credentials: "include" })
      ]);

      const usersData = await usersRes.json();
      const assignedData = await assignedRes.json();
      const assignedIds = assignedData.map(u => Number(u.user_id));

      setUsers(usersData);
      setSelected(assignedIds);
    };

    fetchData();
  }, [test_id]);

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
    const id = Number(userId);
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (selected.length === 0) {
      setHasError(true);
      return;
    }
    setHasError(false);

    const res = await fetch("http://localhost:3000/api/test_users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        test_id: Number(test_id),
        user_ids: selected
      })
    });

    if (res.ok) alert("Пользователи назначены");
    else alert("Ошибка при сохранении");
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
          {sortedUsers.map((user) => {
            const id = Number(user.id);
            const isSelected = selected.includes(id);
            const completed = user.completed || 0;
            const assigned = user.assigned || 0;
            const uncompleted = Math.max(assigned - completed, 0);

            return (
              <li key={id} className="assign__list-row font-base" role="row">
                <span className="assign__user">{user.first_name} {user.last_name}</span>
                <span>{user.age}</span>
                <span>{completed}</span>
                <span>{assigned}</span>
                <span>{uncompleted}</span>
                <span>
                  <button
                    className="assign__toggle"
                    onClick={() => toggleSelect(id)}
                    aria-label={isSelected ? "Убрать пользователя" : "Добавить пользователя"}
                  >
                    <img
                      src={isSelected ? "/icon/delete-minus.svg" : "/icon/add.svg"}
                      className="assign__togle-icon"
                      alt={isSelected ? "Удалить" : "Добавить"}
                    />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <button onClick={handleAssign} className="assign__submit save__button font-base button-block">
        Сохранить изменения
      </button>

      {hasError && (
        <p className="assign__error error font-base">
          Пожалуйста, выберите хотя бы одного пользователя.
        </p>
      )}
    </div>
  );
}
