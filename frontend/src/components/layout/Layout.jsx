import Header from "./Header";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "../../context/UserContext";
import SidePanel from "./SidePanel";

const Layout = () => {
  const { setUser } = useUser();
  const location = useLocation();

  useEffect(() => {
    fetch("http://localhost:3000/api/auth/me", {
      credentials: "include"
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          setUser(null);
          return;
        }
        return res.json();
      })
      .then(data => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => setUser(null));
  }, []);

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="layout-wrapper">
      {!isAuthPage && <Header />}
      <div className="layout">
        {!isAuthPage && <SidePanel />}
        <main className="layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
