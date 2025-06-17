import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";

export default function Header() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const titles = {
    "/ab/create": "A/B тест (создание)",
    "/ab/assign": "Назначение A/B теста",
    "/results": "Результаты",
    "/users": "Пользователи",
    "/groups": "Группы",
    "/settings": "Настройки",
    "/instructions": "Инструкции",
    "/choice": "Создать тест",
    "/create": "Сценарий (создание)",
    "/users": "Пользователи",
    // Добавь другие пути по аналогии
  };

  const getTitle = () => {
    if (location.pathname === "/") {
      return user?.first_name ? `Здравствуйте, ${user.first_name}` : "";
    }

    for (const path in titles) {
      if (location.pathname.startsWith(path)) {
        return titles[path];
      }
    }

    return "Личный кабинет"; // fallback
  };

  const handleLogout = async () => {
    await fetch("http://localhost:3000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header__container">
        <a href="/" className="header__logo-link">
          <img src="/icon/logo.svg" alt="Логотип" className="header__logo-icon" />
        </a>
        <div className="header__content">
          {getTitle() && <h1 className="header__title">{getTitle()}</h1>}
          {user && (
            <button className="header__logout" onClick={handleLogout}>
              <img src="/icon/logout.svg" alt="" className="header__logout-img" />
              Выйти
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
