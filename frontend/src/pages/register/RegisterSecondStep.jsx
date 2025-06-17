import React, { useState } from "react";

function RegisterSecondStep({ onSubmit }) {
  const [errors, setErrors] = useState({});

  const validate = (data) => {
    const errs = {};
    const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s\-]+$/;
    const ageRegex = /^[0-9]+$/;

    if (!data.first_name || !nameRegex.test(data.first_name)) {
      errs.first_name = "Имя должно содержать только буквы";
    }

    if (!data.last_name || !nameRegex.test(data.last_name)) {
      errs.last_name = "Фамилия должна содержать только буквы";
    }

    if (!data.age || !ageRegex.test(data.age.toString()) || Number(data.age) <= 0) {
      errs.age = "Возраст должен быть положительным числом";
    }

    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      first_name: form.first_name.value.trim(),
      last_name: form.last_name.value.trim(),
      age: form.age.value.trim(),
    };

    const validationErrors = validate(data);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      onSubmit({
        ...data,
        age: Number(data.age),
      });
    }
  };

  return (
    <form className="auth-form__form" onSubmit={handleSubmit}>
      <h2 className="auth-form__title">Личный кабинет</h2>

      <input
        className="auth-form__input input"
        name="first_name"
        type="text"
        placeholder="Имя"
      />
      {errors.first_name && <div className="auth-form__error error font-base marg-sm">{errors.first_name}</div>}

      <input
        className="auth-form__input input"
        name="last_name"
        type="text"
        placeholder="Фамилия"
      />
      {errors.last_name && <div className="auth-form__error error font-base marg-sm">{errors.last_name}</div>}

      <input
        className="auth-form__input input"
        name="age"
        type="number"
        placeholder="Возраст"
      />
      {errors.age && <div className="auth-form__error error font-base marg-sm">{errors.age}</div>}

      <button className="auth-form__submit save__button font-base" type="submit">
        Сохранить
      </button>
    </form>
  );
}

export default RegisterSecondStep;
