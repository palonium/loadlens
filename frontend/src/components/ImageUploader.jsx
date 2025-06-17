import { useRef } from "react";

export default function ImageUploader({ onUpload }) {
  const inputRef = useRef();

  const handleFiles = (files) => {
    const file = files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Недопустимый формат файла");
      return;
    }

    onUpload(file); // Только отдаём файл родителю
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const openFileDialog = () => inputRef.current.click();

  return (
    <div
      className="image-upload base-border-radius"
      onClick={openFileDialog}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        className="image-upload__input"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="image-upload__label">
        <p className="image-upload__text font-base">Перетащите, чтобы загрузить файл</p>
        <p className="image-upload__formats">
          Поддерживаются JPG, JPEG, PNG, GIF<br />или WEBP
        </p>
        <div className="image-upload__button">
          <img src="/icon/upload.svg" className="image-upload__icon"/>
          Загрузить
        </div>
      </div>
    </div>
  );
}
