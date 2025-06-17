import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ConfirmModal from "../components/modals/ConfirmModal";

export default function ABResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const pdfRef = useRef(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/test_users/viewed/${id}`, {
      method: "PATCH",
      credentials: "include",
    });

    fetch(`http://localhost:3000/api/ab/stats/${id}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setSummary(data.rows || data);
        setTitle(data.title || "");
        setDescription(data.description || "");
      });
  }, [id]);

  const handleExportPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const opt = {
      margin: 0.5,
      filename: `ab-test-report-${id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    const blob = await html2pdf().from(pdfRef.current).set(opt).outputPdf("blob");

    const fileName = `ab-test-report-${id}.pdf`;
    const file = new File([blob], fileName, { type: "application/pdf" });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("test_id", id);

    const res = await fetch("http://localhost:3000/api/reports", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (res.ok) {
      alert("PDF успешно экспортирован и сохранён");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert("Ошибка при экспорте PDF");
    }
  };

  const handleDelete = async () => {
    const res = await fetch(`http://localhost:3000/api/ab-tests/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
  
    if (res.ok) {
      navigate("/");
    } else {
      const err = await res.json();
      alert("Ошибка при удалении A/B теста: " + (err?.error || "Неизвестно"));
    }
  };
  

  return (
    <main className="ab-results page" ref={pdfRef}>
      <section className="ab-results__info">
        <div className="ab-results__field">
          <h2 className="ab-results__label font-base base-color-text">Название теста</h2>
          <p className="ab-results__value base-border-radius border-base">{title}</p>
        </div>
        <div className="ab-results__field">
          <h2 className="ab-results__label font-base base-color-text">Краткое описание</h2>
          <p className="ab-results__value base-border-radius border-base">{description}</p>
        </div>
      </section>

      <section className="ab-results__list">
        {summary.map((s, i) => {
          const percentA = s.total_answers > 0 ? Math.round((s.count_a / s.total_answers) * 100) : 0;
          const percentB = s.total_answers > 0 ? Math.round((s.count_b / s.total_answers) * 100) : 0;

          return (
            <article key={i} className="ab-results__task">
              <h3 className="ab-results__number number base-text-color">{i + 1}</h3>
              <div className="ab-results__field marg-large">
                <h2 className="ab-results__label font-base base-color-text">Задача для пользователя</h2>
                <p className="ab-results__value base-border-radius border-base">{s.task_text}</p>
              </div>
              <div className="ab-results__images">
                <figure className="ab-results__option">
                  <img src={s.image_a} alt="Вариант A" className="ab-results__image base-border-radius" />
                  <figcaption
                    className={
                      "ab-results__percent " +
                      (percentA > percentB
                        ? "ab-results__percent--highlight"
                        : "ab-results__percent--secondary")
                    }
                  >
                    {percentA}%
                  </figcaption>
                </figure>

                <figure className="ab-results__option">
                  <img src={s.image_b} alt="Вариант B" className="ab-results__image" />
                  <figcaption
                    className={
                      "ab-results__percent " +
                      (percentB > percentA
                        ? "ab-results__percent--highlight"
                        : "ab-results__percent--secondary")
                    }
                  >
                    {percentB}%
                  </figcaption>
                </figure>
              </div>
            </article>
          );
        })}
      </section>

      <footer className="ab-results__actions">
        <button
          className="ab-results__button ab-results__button--delete delete-button font-base"
          onClick={() => setShowConfirmModal(true)}
        >
          <img src="/icon/delete-color.svg" alt="" />
          Удалить
        </button>
        <button
          onClick={handleExportPDF}
          className="ab-results__button ab-results__button--export save__button font-base"
        >
          Экспортировать в pdf
        </button>
      </footer>

      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmModal(false)}
        message="Вы уверены, что хотите удалить результат прохождения теста?"
      />
    </main>
  );
}
