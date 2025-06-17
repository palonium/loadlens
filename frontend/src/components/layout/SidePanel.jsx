import { NavLink } from "react-router-dom";
import { useUser } from "../../context/UserContext";

export default function SidePanel() {
    const { user } = useUser();
  
    return (
      <aside className="side-panel">
        <nav className="side-panel__nav">
          <ul>
            {user?.role === "admin" ? (
              <>
                <li className="side-panel__nav-item">
                  <NavLink className="side-panel__link" to="/choice">
                    <img src="icon/side/add.svg" alt="" className="side-panel__link-icon" />
                    Создать тест
                  </NavLink>
                </li>
                <li className="side-panel__nav-item">
                  <NavLink className="side-panel__link" to="/results">
                    <img src="icon/side/result.svg" alt="" className="side-panel__link-icon" />
                    Результаты
                  </NavLink>
                </li>
                <li className="side-panel__nav-item">
                  <NavLink className="side-panel__link" to="/users">
                    <img src="icon/side/user.svg" alt="" className="side-panel__link-icon" />
                    Пользователи
                  </NavLink>
                </li>
                <li className="side-panel__nav-item">
                  <NavLink className="side-panel__link" to="/groups">
                    <img src="icon/side/group.svg" alt="" className="side-panel__link-icon" />
                    Группы
                  </NavLink>
                </li>
                {/* <li className="side-panel__nav-item">
                  <NavLink className="side-panel__link" to="/settings">
                    <img src="icon/side/settings.svg" alt="" className="side-panel__link-icon" />
                    Настройки
                  </NavLink>
                </li> */}
              </>
            ) : (
              <>
                <li className="side-panel__nav-item">
                  <NavLink className="side-panel__link" to="/assigned">
                    <img src="icon/side/result.svg" alt="" className="side-panel__link-icon" />
                    Тесты
                  </NavLink>
                </li>
                {/* <li className="side-panel__nav-item">
                  <NavLink className="side-panel__link" to="/settings">
                    <img src="icon/side/settings.svg" alt="" className="side-panel__link-icon" />
                    Настройки
                  </NavLink>
                </li> */}
              </>
            )}
          </ul>
        </nav>
      </aside>
    );
  }
  