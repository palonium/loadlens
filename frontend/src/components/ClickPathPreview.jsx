export default function ClickPathPreview({ pathData, imageUrl }) {
  if (!Array.isArray(pathData) || pathData.length === 0) {
    return <p className="click-path__empty">Нет данных</p>;
  }

  const first = pathData[0];
  const originalWidth = first?.w || 1900;
  const originalHeight = first?.h || 936;

  return (
    <div
      className="click-path__wrapper"
      style={{
        aspectRatio: `${originalWidth} / ${originalHeight}`,
      }}
    >
      <svg
        viewBox={`0 0 ${originalWidth} ${originalHeight}`}
        className="click-path__svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <image
          href={imageUrl}
          x="0"
          y="0"
          width={originalWidth}
          height={originalHeight}
          preserveAspectRatio="xMidYMid slice"
        />

        {/* линии между точками */}
        {pathData.map((point, i) => {
          const next = pathData[i + 1];
          return next ? (
            <line
              key={i}
              x1={point.x}
              y1={point.y}
              x2={next.x}
              y2={next.y}
              stroke="#6c3ee6"
              strokeWidth={2}
            />
          ) : null;
        })}

        {/* точки */}
        {pathData.map((point, i) => (
            <g key={`point-${i}`}>
                <circle
                cx={point.x}
                cy={point.y}
                r={6}
                fill={point.hit ? "#198754" : "#dc3545"}
                stroke="#fff"
                strokeWidth={1}
                />
                <text
                x={point.x + 8}
                y={point.y - 8}
                fontSize="12"
                fill="#5623B4"
                >
                {point.duration}s
                </text>
            </g>
            ))}

      </svg>
    </div>
  );
}
