import React from "react";

export default function ConfirmModal({ isOpen, onConfirm, onCancel, message = "Вы действительно хотите удалить выбранный элемент?" }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal">
      <div className="confirm-modal__overlay" onClick={onCancel}></div>
      <div className="confirm-modal__content base-border-radius">
        <p className="confirm-modal__text font-base">{message}</p>
        <div className="confirm-modal__actions">
          <button className="confirm-modal__button confirm-modal__button--confirm" onClick={onConfirm}>
            Удалить
          </button>
          <button className="confirm-modal__button confirm-modal__button--cancel" onClick={onCancel}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
