import React from "react";

function RegisterForm() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const body = {
      email: form.email.value,
      password: form.password.value,
      first_name: form.first_name.value,
      last_name: form.last_name.value,
      age: Number(form.age.value),
    };

    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("Регистрация:", data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Пароль" />
      <input name="first_name" placeholder="Имя" />
      <input name="last_name" placeholder="Фамилия" />
      <input name="age" placeholder="Возраст" type="number" />
      <button type="submit">Зарегистрироваться</button>
    </form>
  );
}

export default RegisterForm;