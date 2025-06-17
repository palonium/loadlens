import { useEffect, useRef, useState } from "react";
import ConfirmModal from "../components/modals/ConfirmModal";

function pluralize(count, one, few, many) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [sortBy, setSortBy] = useState("age-asc");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  const [userToDelete, setUserToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/api/users")
      .then(res => res.json())
      .then(setUsers);
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

  const confirmDeleteUser = (userId) => {
    setUserToDelete(userId);
    setIsModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!userToDelete) return;

    const res = await fetch(`http://localhost:3000/api/users/${userToDelete}`, {
      method: "DELETE"
    });

    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete));
    } else {
      alert("Ошибка при удалении пользователя");
    }

    setUserToDelete(null);
    setIsModalOpen(false);
  };

  const sortedUsers = [...users].sort((a, b) => {
    switch (sortBy) {
      case "age-asc": return a.age - b.age;
      case "age-desc": return b.age - a.age;
      case "email-asc": return a.email.localeCompare(b.email);
      case "email-desc": return b.email.localeCompare(a.email);
      default: return 0;
    }
  });

  return (
    <div className="assign page">
      <p className="assign__title font-md">Все пользователи</p>

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
              <div onClick={() => setSortBy("email-asc")}>Email (А-Я)</div>
              <div onClick={() => setSortBy("email-desc")}>Email (Я-А)</div>
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
          <span>Удалить</span>
        </div>

        <ul className="assign__list-body">
          {sortedUsers.map(user => {
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
                    className="assign__delete-button"
                    onClick={() => confirmDeleteUser(user.id)}
                  >
                    <img src="/icon/delete-color.svg" alt="Удалить" />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <ConfirmModal
        isOpen={isModalOpen}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setIsModalOpen(false)}
        message="Вы действительно хотите удалить выбранный элемент?"
      />
    </div>
  );
}
