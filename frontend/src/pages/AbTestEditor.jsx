import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageUploader from "../components/ImageUploader";

export default function AbTestEditor() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [errors, setErrors] = useState({});

  const handleAddQuestion = () => {
    setQuestions([...questions, { task_text: "", imageA: null, imageB: null }]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = async (index, type, file) => {
    const base64 = await fileToBase64(file);
    const updated = [...questions];
    updated[index][type] = base64;
    setQuestions(updated);
  };

  const handleTaskTextChange = (index, value) => {
    const updated = [...questions];
    updated[index].task_text = value;
    setQuestions(updated);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    const validationErrors = {};
    if (!title.trim()) validationErrors.title = "Введите название теста";
    if (!description.trim()) validationErrors.description = "Введите описание";

    if (questions.length === 0) {
      validationErrors.form = "Добавьте хотя бы один вопрос";
    }

    questions.forEach((q, i) => {
      if (!q.task_text.trim()) {
        validationErrors[`task_text_${i}`] = "Введите задание";
      }
      if (!q.imageA || !q.imageB) {
        validationErrors[`images_${i}`] = "Загрузите два изображения";
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    const preparedQuestions = questions.map((q) => ({
      task_text: q.task_text,
      images: [
        { image_type: "A", image_url: q.imageA },
        { image_type: "B", image_url: q.imageB }
      ]
    }));

    const body = { title, description, questions: preparedQuestions };

    const res = await fetch("http://localhost:3000/api/ab-tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (data.success) {
      navigate(`/assign/${data.test_id}`);
    } else {
      alert("Ошибка при создании теста");
    }
  };

  return (
    <div className="ab-editor page">
      <div className="ab-editor__row input-group">
        <label className="ab-editor__label input-group-item font-base gap-base">
          Введите название теста
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например, сравнение интерфейсов"
            className="ab-editor__input input"
          />
          {errors.title && <div className="error">{errors.title}</div>}
        </label>

        <label className="ab-editor__label input-group-item font-base gap-base">
          Введите краткое описание
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Краткое описание теста"
            className="ab-editor__input input"
          />
          {errors.description && <div className="error">{errors.description}</div>}
        </label>
      </div>

      {questions.map((q, index) => (
        <div key={index} className="ab-editor__question-block">
          <div className="ab-editor__question-header">
            <span className="ab-editor__question-index">{index + 1}</span>
            <button
              className="ab-editor__delete-button font-base"
              onClick={() => handleRemoveQuestion(index)}
            >
              <img src="/icon/delete-color.svg" alt="Удалить" />
              Удалить
            </button>
          </div>

          <label className="ab-editor__label font-base gap-base">
            Формулировка задания
            <input
              type="text"
              value={q.task_text}
              onChange={(e) => handleTaskTextChange(index, e.target.value)}
              placeholder="Опишите, что должен сделать пользователь"
              className="ab-editor__input-task input"
            />
            {errors[`task_text_${index}`] && <div className="error">{errors[`task_text_${index}`]}</div>}
          </label>

          <div className="ab-editor__images input-group">
            {["imageA", "imageB"].map((type) => (
              <div key={type} className="input-group-item font-base">
                {!q[type] ? (
                  <ImageUploader onUpload={(file) => handleImageChange(index, type, file)} />
                ) : (
                  <div className="ab-editor__image-wrapper">
                    <img
                      src={q[type]}
                      alt={type}
                      className="ab-editor__preview"
                    />
                    <button
                      className="ab-editor__image-delete-button"
                      onClick={() => {
                        const updated = [...questions];
                        updated[index][type] = null;
                        setQuestions(updated);
                      }}
                    >
                      <img src="/icon/delete.svg" alt="Удалить изображение" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {errors[`images_${index}`] && <div className="error font-base">{errors[`images_${index}`]}</div>}
        </div>
      ))}

      <button onClick={handleAddQuestion} className="ab-editor__add-button font-base">
        <img src="/icon/add.svg" alt="" /> Добавить вопрос
      </button>

      {errors.form && <div className="error font-base">{errors.form}</div>}

      <button onClick={handleSubmit} className="ab-editor__save-button save__button font-base button-block">
        Продолжить
      </button>
    </div>
  );
}
