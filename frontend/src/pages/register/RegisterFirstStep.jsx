import React, { useState } from "react";

function RegisterFirstStep({ onNext }) {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = (data) => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.email || !emailRegex.test(data.email)) {
      errs.email = "Введите корректный email";
    }

    if (!data.password || data.password.length < 8) {
      errs.password = "Пароль должен содержать минимум 8 символов";
    }

    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      email: form.email.value.trim(),
      password: form.password.value,
    };

    const validationErrors = validate(data);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      onNext(data);
    }
  };

  return (
    <form className="auth-form__form" onSubmit={handleSubmit}>
      <h2 className="auth-form__title">Регистрация</h2>

      <input
        className="auth-form__input input"
        name="email"
        type="email"
        placeholder="Email"
        autoComplete="username"
      />
      {errors.email && <div className="error font-base marg-sm">{errors.email}</div>}

      <div className="auth-form__input-wrap">
        <input
          className="auth-form__input input"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Пароль"
          autoComplete="new-password"
        />
        <button
          type="button"
          className="auth-form__toggle"
          onClick={() => setShowPassword(!showPassword)}
          aria-label="Показать/скрыть пароль"
        >
          <img src={`/icon/${showPassword ? "eye" : "eye-off"}.svg`} alt="" />
        </button>
      </div>
      {errors.password && <div className="error font-base marg-sm">{errors.password}</div>}

      <button className="auth-form__submit save__button font-base" type="submit">
        Далее
      </button>
    </form>
  );
}

export default RegisterFirstStep;
