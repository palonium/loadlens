import { useState } from "react";

export default function TaskModal({ isOpen, onSave, onClose }) {
  const [value, setValue] = useState("");

  const handleSave = () => {
    if (value.trim()) {
      onSave(value);
      setValue("");
    }
  };

  const handleClose = () => {
    setValue("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="task-modal">
      <div className="task-modal__content">
        <label className="task-modal__label">Введите задачу для пользователя</label>
        <input
          type="text"
          placeholder="Например, добавить товар в корзину"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="task-modal__input"
        />
        <div className="task-modal__actions">
          <button className="task-modal__cancel" onClick={handleClose}>Отмена</button>
          <button className="task-modal__save" onClick={handleSave}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}
