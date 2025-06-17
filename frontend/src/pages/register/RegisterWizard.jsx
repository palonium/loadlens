import React, { useState } from "react";
import RegisterFirstStep from "./RegisterFirstStep";
import RegisterSecondStep from "./RegisterSecondStep";

function RegisterWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "", password: "", first_name: "", last_name: "", age: ""
  });

  const handleNext = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleSubmit = async (data) => {
    const fullData = { ...formData, ...data };
    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullData),
    });
    const result = await res.json();
    console.log("✅ Регистрация:", result);
  };

  return (
    <div className="auth-form page">
      {step === 1 && <RegisterFirstStep onNext={handleNext} />}
      {step === 2 && <RegisterSecondStep onSubmit={handleSubmit} />}
    </div>
  );
}

export default RegisterWizard;
