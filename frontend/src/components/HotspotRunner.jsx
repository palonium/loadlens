import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

export default function HotspotRunner() {
  const { id } = useParams();
  const canvasRef = useRef(null);

  const [scenario, setScenario] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [stepStartTime, setStepStartTime] = useState(null);
  const [clicks, setClicks] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3000/api/scenarios/by-test/${id}`, {
      credentials: "include"
    })
      .then((res) => {
        if (!res.ok) throw new Error("Сценарий не найден");
        return res.json();
      })
      .then((data) => {
        setScenario(data);
        setStartTime(Date.now());
        setStepStartTime(Date.now());
      })
      .catch((err) => {
        console.error("❌ Ошибка загрузки сценария:", err);
        setScenario(null);
      });
  }, [id]);

  const handleClick = async (e) => {
    if (!scenario || completed || !scenario.steps[currentStep]) return;
  
    const img = canvasRef.current;
    const rect = img.getBoundingClientRect();
  
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
  
    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;
  
    const realX = clickX * scaleX;
    const realY = clickY * scaleY;
  
    const step = scenario.steps[currentStep];
  
    const stepLeft = step.x * img.naturalWidth;
    const stepTop = step.y * img.naturalHeight;
    const stepRight = stepLeft + step.width * img.naturalWidth;
    const stepBottom = stepTop + step.height * img.naturalHeight;
  
    const now = Date.now();
    const duration = Math.floor((now - stepStartTime) / 1000);
  
    const hit =
      realX >= stepLeft &&
      realX <= stepRight &&
      realY >= stepTop &&
      realY <= stepBottom;
  
    const clickData = {
      x: realX,
      y: realY,
      width: img.clientWidth,
      height: img.clientHeight,
      timestamp: now,
      step: currentStep,
      hit,
      duration
    };
  
    const updatedClicks = [...clicks, clickData];
  
    console.log("👉 Клик:", clickData, "➡️ Успешный?", hit);
  
    if (hit) {
      if (currentStep + 1 >= scenario.steps.length) {
        const totalTime = Math.floor((now - startTime) / 1000);
        setCompleted(true);
  
        try {
          await fetch(`http://localhost:3000/api/scenarios/complete/${scenario.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              duration: totalTime,
              clicks: updatedClicks,
              errorCount
            })
          });
  
          await fetch(`http://localhost:3000/api/test_users/complete/${scenario.test_id}`, {
            method: "POST",
            credentials: "include"
          });
  
          console.log("✅ Сценарий завершён и зафиксирован.");
        } catch (err) {
          console.error("❌ Ошибка при фиксации прохождения:", err);
        }
      } else {
        setCurrentStep(currentStep + 1);
        setStepStartTime(now);
        setClicks(updatedClicks);
      }
    } else {
      setClicks(updatedClicks);
      setErrorCount((prev) => prev + 1);
    }
  };
  

  if (!scenario) return <p>❗ Сценарий не найден или произошла ошибка</p>;

  const stepLabel = scenario.steps[currentStep]?.label || "Нет задания";

  return (
    <div className="hotspot-runner page">
      <h2 className="font-md base-color-text marg-large">
        {currentStep + 1}. {stepLabel}
      </h2>

      <div className="hotspot-runner__canvas-wrap" style={{ position: "relative" }}>
        <img
          src={scenario.environment_url}
          ref={canvasRef}
          onClick={handleClick}
          onLoad={() => setImageReady(true)}
          alt="Scenario"
          className="hotspot-runner__canvas"
        />

        {imageReady && scenario.steps[currentStep] && (
          (() => {
            const step = scenario.steps[currentStep];

            const left = `${step.x * 100}%`;
            const top = `${step.y * 100}%`;
            const width = `${step.width * 100}%`;
            const height = `${step.height * 100}%`;

            return (
              <div
                className="hotspot-runner__target"
                style={{
                  position: "absolute",
                  // border: "2px dashed red",
                  // backgroundColor: "rgba(255, 0, 0, 0.2)",
                  left,
                  top,
                  width,
                  height,
                  pointerEvents: "none",
                  zIndex: 1000
                }}
              />
            );
          })()
        )}
        
      </div>

      <div className="hotspot-runner__info-card">
  <h3 className="hotspot-runner__info-title">📊 Прогресс</h3>

  <div className="hotspot-runner__info-group">
    <div className="hotspot-runner__info-label">Шаг</div>
    <div className="hotspot-runner__info-value">{currentStep + 1} / {scenario.steps.length}</div>
  </div>

  <div className="hotspot-runner__progress-bar">
    <div
      className="hotspot-runner__progress-fill"
      style={{ width: `${((currentStep + 1) / scenario.steps.length) * 100}%` }}
    />
  </div>

  <div className="hotspot-runner__info-group error">
    <div className="hotspot-runner__info-label">Ошибки</div>
    <div className="hotspot-runner__info-value">{errorCount}</div>
  </div>

  <div className="hotspot-runner__info-group">
    <div className="hotspot-runner__info-label">Клики</div>
    <div className="hotspot-runner__info-value">{clicks.length}</div>
  </div>
</div>


      {completed && (
        <p className="hotspot-runner__completed">
          ✅ Завершено! Ошибки: {errorCount}, Клики: {clicks.length}
        </p>
      )}
    </div>
  );
}
