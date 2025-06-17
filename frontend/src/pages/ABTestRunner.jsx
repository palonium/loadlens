import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ABTestRunner() {
  const { id } = useParams(); // test_id
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3000/api/questions/by-test/${id}`, {
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data);
        setStartTime(Date.now());
        setLoading(false);
      });
  }, [id]);

  const handleSelect = (imageType) => {
    setSelectedImage(imageType);
  };

  const handleNext = async () => {
    const answerTime = Math.floor((Date.now() - startTime) / 1000);
    const question = questions[current];

    // Отправляем ответ
    await fetch("http://localhost:3000/api/ab/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        question_id: question.id,
        selected_image: selectedImage,
        answer_time: answerTime
      })
    });

    if (current + 1 >= questions.length) {
      await fetch(`http://localhost:3000/api/test_users/complete/${id}`, {
        method: "POST",
        credentials: "include"
      });
    
      alert("✅ Тест завершён!");
      navigate("/assigned");
    } else {
      setCurrent(current + 1);
      setSelectedImage(null);
      setStartTime(Date.now());
    }
  };

  if (loading) return <p>Загрузка теста...</p>;
  if (!questions.length) return <p>Вопросы не найдены</p>;

  const question = questions[current];
  const images = question.images || [];

  return (
<div className="ab-runner page">
  <h2 className="font-md base-color-text marg-large">
    {current + 1}. Выберите предпочтительный вариант
  </h2>

  <div className="ab-runner__options">
    {images.map((img, idx) => (
      <div
        key={idx}
        className={`ab-runner__option${selectedImage === img.image_type ? " ab-runner__option--selected" : ""}`}
        onClick={() => handleSelect(img.image_type)}
      >
        <div className="ab-runner__image-wrap">
          <img
            src={img.image_url}
            alt={`Вариант ${img.image_type}`}
            className="ab-runner__image"
          />
        </div>
        <p className="ab-runner__label">
          {img.image_url.split("/").pop()}
        </p>
      </div>
    ))}
  </div>

  <div className="ab-runner__footer">
    <button
      className="ab-runner__button save__button"
      onClick={handleNext}
      disabled={!selectedImage}
    >
      {current + 1 === questions.length ? "Завершить" : "Продолжить"}
    </button>
  </div>
</div>

  );
}
