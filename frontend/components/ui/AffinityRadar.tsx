"use client";

interface AffinityRadarProps {
  affinity: {
    offense: number;
    tank: number;
    support: number;
    scout: number;
    hybrid: number;
  };
  size?: number;
}

export function AffinityRadar({ affinity, size = 120 }: AffinityRadarProps) {
  const skills = [
    { name: "Offense", value: affinity.offense, color: "#ff7a00" },
    { name: "Tank", value: affinity.tank, color: "#ff7a00" },
    { name: "Support", value: affinity.support, color: "#ff7a00" },
    { name: "Scout", value: affinity.scout, color: "#ff7a00" },
    { name: "Hybrid", value: affinity.hybrid, color: "#ff7a00" },
  ];

  const maxValue = 100;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 3;
  const angle = (Math.PI * 2) / skills.length;

  const getCoordinates = (value: number, index: number) => {
    const adjustedValue = Math.min(value, maxValue);
    const adjustedRadius = (adjustedValue / maxValue) * radius;
    const currentAngle = angle * index - Math.PI / 2;
    return {
      x: centerX + adjustedRadius * Math.cos(currentAngle),
      y: centerY + adjustedRadius * Math.sin(currentAngle),
    };
  };

  const points = skills
    .map((_, index) => getCoordinates(skills[index].value, index))
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  const gridLines = [0.25, 0.5, 0.75, 1].map((level) => {
    const gridPoints = skills
      .map((_, index) => {
        const adjustedRadius = level * radius;
        const currentAngle = angle * index - Math.PI / 2;
        return {
          x: centerX + adjustedRadius * Math.cos(currentAngle),
          y: centerY + adjustedRadius * Math.sin(currentAngle),
        };
      })
      .map((p) => `${p.x},${p.y}`)
      .join(" ");
    return gridPoints;
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} className="drop-shadow-lg">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {gridLines.map((gridPoint, idx) => (
          <polygon
            key={`grid-${idx}`}
            points={gridPoint}
            fill="none"
            stroke="#2b2b2b"
            strokeWidth="0.5"
            opacity="0.5"
          />
        ))}

        {skills.map((skill, index) => {
          const { x, y } = getCoordinates(skill.value, index);
          return (
            <line
              key={`axis-${index}`}
              x1={centerX}
              y1={centerY}
              x2={centerX + radius * Math.cos(angle * index - Math.PI / 2)}
              y2={centerY + radius * Math.sin(angle * index - Math.PI / 2)}
              stroke="#2b2b2b"
              strokeWidth="0.5"
              opacity="0.5"
            />
          );
        })}

        <polygon
          points={points}
          fill="#ff7a00"
          fillOpacity="0.2"
          stroke="#ff7a00"
          strokeWidth="2"
          filter="url(#glow)"
        />

        {skills.map((_, index) => {
          const { x, y } = getCoordinates(skills[index].value, index);
          return (
            <circle
              key={`point-${index}`}
              cx={x}
              cy={y}
              r="2"
              fill="#ff7a00"
            />
          );
        })}
      </svg>

      <div className="grid grid-cols-2 gap-1 text-xs text-center">
        {skills.map((skill) => (
          <div key={skill.name} className="text-[#cfcfcf]">
            <div className="font-semibold">{skill.name}</div>
            <div className="text-[#ff7a00]">{Math.round(skill.value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
