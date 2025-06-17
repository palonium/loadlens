// src/components/ScenarioRunner.jsx
import { useEffect, useRef, useState } from "react";

export default function ScenarioRunner() {
  const scenario = {
    id: 1,
    task_text: "Найдите и нажмите кнопку 'Подписаться'.",
    environment_url: "/test-env.html" // локальная среда
  };

  const iframeRef = useRef(null);
  const [clicks, setClicks] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    const iframe = iframeRef.current;

    const handleIframeLoad = () => {
      const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
      if (!doc) return;

      setStartTime(Date.now());

      const handleClick = (e) => {
        const path = e.composedPath().map((el) =>
          el.tagName ? el.tagName : el.nodeName
        );

        const clickData = {
          tag: e.target.tagName,
          text: e.target.innerText,
          x: e.clientX,
          y: e.clientY,
          path,
          timestamp: Date.now()
        };

        setClicks((prev) => [...prev, clickData]);
        setClickCount((prev) => prev + 1);
      };

      doc.addEventListener("click", handleClick);

      // очистка при размонтировании
      return () => doc.removeEventListener("click", handleClick);
    };

    iframe?.addEventListener("load", handleIframeLoad);

    return () => iframe?.removeEventListener("load", handleIframeLoad);
  }, []);

  const handleFinish = () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    console.log("🧠 Сценарий завершён:");
    console.log("⏱️ Время:", duration, "сек");
    console.log("🖱️ Клики:", clickCount);
    console.log("📍 Подробности:", clicks);
  };

  return (
    <div className="scenario">
      <h2 className="scenario__title">{scenario.task_text}</h2>

      <iframe
        ref={iframeRef}
        src={scenario.environment_url}
        className="scenario__frame"
        title="Среда"
        style={{
          width: "100%",
          height: "500px",
          border: "1px solid #ccc",
          marginBottom: "1rem"
        }}
      />

      <button onClick={handleFinish} className="scenario__finish">
        Завершить тест
      </button>
    </div>
  );
}
