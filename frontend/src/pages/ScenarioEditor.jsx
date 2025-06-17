import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageUploader from "../components/ImageUploader";
import TaskModal from "../components/modals/TaskModal";

export default function ScenarioEditor() {
  const navigate = useNavigate();
  const imageContainerRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskText, setTaskText] = useState("Опишите задание для пользователя");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [steps, setSteps] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [currentRect, setCurrentRect] = useState(null);
  const [errors, setErrors] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingRect, setPendingRect] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Введите название теста";
    if (!description.trim()) newErrors.description = "Введите описание";
    if (!taskText.trim()) newErrors.taskText = "Введите задание";
    if (!imageFile) newErrors.image = "Загрузите изображение";
    if (steps.length === 0) newErrors.steps = "Добавьте хотя бы один шаг";
    return newErrors;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("http://localhost:3000/api/scenarios/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    const fullUrl = `http://localhost:3000${data.imageUrl}`;
    setImagePreview(fullUrl);
    setImageFile({ name: file.name, url: fullUrl });
  };

  const handleMouseDown = (e) => {
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPoint({ x, y });
    setCurrentRect({ x, y, width: 0, height: 0 });
    setDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x2 = e.clientX - rect.left;
    const y2 = e.clientY - rect.top;

    const x = Math.min(startPoint.x, x2);
    const y = Math.min(startPoint.y, y2);
    const width = Math.abs(x2 - startPoint.x);
    const height = Math.abs(y2 - startPoint.y);
    setCurrentRect({ x, y, width, height });
  };

  const handleMouseUp = () => {
    if (!currentRect || currentRect.width < 5 || currentRect.height < 5) {
      setDrawing(false);
      setCurrentRect(null);
      return;
    }

    setPendingRect(currentRect);
    setIsModalOpen(true);
    setDrawing(false);
    setCurrentRect(null);
  };

  const handleSaveTask = (label) => {
    const container = imageContainerRef.current.getBoundingClientRect();
  
    const relativeStep = {
      x: +(pendingRect.x / container.width).toFixed(4),
      y: +(pendingRect.y / container.height).toFixed(4),
      width: +(pendingRect.width / container.width).toFixed(4),
      height: +(pendingRect.height / container.height).toFixed(4),
      label
    };
  
    setSteps((prev) => [...prev, relativeStep]);
    setPendingRect(null);
    setIsModalOpen(false);
  };
  

  const handleDeleteStep = (index) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExport = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    const body = {
      title,
      description,
      task_text: description, // ✅ используем description как текст задания
      image_url: imageFile.url,
      steps
    };
  
    const res = await fetch("http://localhost:3000/api/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    });
  
    const data = await res.json();
    if (data.test_id) {
      navigate(`/assign/${data.test_id}`);
    } else {
      alert("Сценарий сохранён, но test_id не получен");
    }
  };
  

  return (
    <div className="scenario-editor page">
      {/* Ввод названия и описания */}
      <div className="scenario-editor__row input-group">
        <label className="scenario-editor__label input-group-item font-base">
          Введите название теста
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например, сайт аренды домов"
            className="scenario-editor__input input"
          />
          {errors.title && <div className="scenario-editor__error">{errors.title}</div>}
        </label>

        <label className="scenario-editor__label input-group-item font-base">
          Введите краткое описание
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Например, определение наилучшего решения"
            className="scenario-editor__input input"
          />
          {errors.description && <div className="scenario-editor__error">{errors.description}</div>}
        </label>
      </div>

      {/* Загрузка изображения */}
      <ImageUploader onUpload={(file) => handleImageUpload({ target: { files: [file] } })} />
      {errors.image && <div className="scenario-editor__error">{errors.image}</div>}

      {/* Рисование поверх изображения */}
      {imagePreview && (
        <div
          ref={imageContainerRef}
          className="scenario-editor__image-container"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <img src={imagePreview} alt="Scenario" className="scenario-editor__image" />
          {currentRect && (
            <div
              className="scenario-editor__drawing-rect"
              style={{
                left: currentRect.x,
                top: currentRect.y,
                width: currentRect.width,
                height: currentRect.height
              }}
            />
          )}
          {steps.map((step, i) => (
            <div
              key={i}
              className="scenario-editor__step-rect"
              style={{
                left: `${step.x * 100}%`,
                top: `${step.y * 100}%`,
                width: `${step.width * 100}%`,
                height: `${step.height * 100}%`
              }}
              title={step.label}
            />
          ))}

        </div>
      )}
      {errors.steps && <div className="scenario-editor__error">{errors.steps}</div>}

      {/* Список шагов */}
      {steps.length > 0 && (
        <div className="scenario-editor__steps">
          <ul className="scenario-editor__steps-list">
            {steps.map((s, i) => (
              <li key={i} className="scenario-editor__step-item">
                <div className="scenario-editor__step-info">
                  <span className="scenario-editor__step-index">{i + 1} </span>
                  <span className="scenario-editor__step-text font-base base-color-text">{s.label}</span>
                </div>
                <button
                  onClick={() => handleDeleteStep(i)}
                  className="scenario-editor__delete-button"
                >
                  <img src="icon/delete.svg" alt="" />
                </button>
              </li>
            ))}
          </ul>

        </div>
      )}

      <button onClick={handleExport} className="scenario-editor__save-button save__button font-base">
        Продолжить
      </button>

      <TaskModal
        isOpen={isModalOpen}
        onSave={handleSaveTask}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
