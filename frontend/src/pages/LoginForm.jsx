import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";

function LoginForm() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const body = {
      email: form.email.value,
      password: form.password.value,
    };

    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include"
    });

    const data = await res.json();
    if (data.user) {
      setUser(data.user);
      navigate("/");
    }
  };

  return (
    <div className="auth-form page">
      <form className="auth-form__form" onSubmit={handleSubmit}>
        <h2 className="auth-form__title">Вход</h2>

        <input
          className="auth-form__input input"
          name="email"
          type="text"
          placeholder="Логин"
          autoComplete="username"
        />

        <div className="auth-form__input-wrap">
          <input
            className="auth-form__input input"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Пароль"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="auth-form__toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Показать/скрыть пароль"
          >
            <img
              src={`/icon/${showPassword ? "eye" : "eye-off"}.svg`}
              alt=""
            />
          </button>
        </div>

        <button className="auth-form__submit save__button font-base auth-button" type="submit">
          Войти
        </button>

        <div className="auth-form__separator">или</div>

        <Link to="/register" className="auth-form__link font-md">
          Зарегистрироваться
        </Link>
      </form>
    </div>
  );
}

export default LoginForm;
