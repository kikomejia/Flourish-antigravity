import React from "react";

const VIRTUES = [
  { key: "wisdom", label: "WISDOM", color: "#d8b4fe" },
  { key: "courage", label: "COURAGE", color: "#fef08a" },
  { key: "humanity", label: "HUMANITY", color: "#fda4af" },
  { key: "justice", label: "JUSTICE", color: "#86efac" },
  { key: "temperance", label: "TEMPERANCE", color: "#ffedd5" },
  { key: "transcendence", label: "TRANSCENDENCE", color: "#7dd3fc" },
];

// Hexagon vertices (flat-top), center 160,160, radius 120
const R = 120;
const CX = 160;
const CY = 160;

function hexVertex(i) {
  const angle = (Math.PI / 3) * i - Math.PI / 2;
  return [CX + R * Math.cos(angle), CY + R * Math.sin(angle)];
}

const vertices = Array.from({ length: 6 }, (_, i) => hexVertex(i));

// Edge i goes from vertex i to vertex (i+1)%6
// Map virtue index to edge:
// 0=wisdom(top edge=0: v0→v1), 1=courage(top-right=1: v1→v2), 2=humanity(bottom-right=2: v2→v3)
// 3=justice(bottom=3: v3→v4), 4=temperance(bottom-left=4: v4→v5), 5=transcendence(top-left=5: v5→v0)

function edgeLabelPos(i) {
  const [x1, y1] = vertices[i];
  const [x2, y2] = vertices[(i + 1) % 6];
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  // Push label outward from center
  const dx = mx - CX;
  const dy = my - CY;
  const len = Math.sqrt(dx * dx + dy * dy);
  return { x: mx + (dx / len) * 22, y: my + (dy / len) * 22 };
}

function edgeAngle(i) {
  const [x1, y1] = vertices[i];
  const [x2, y2] = vertices[(i + 1) % 6];
  return (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
}

export default function VirtueHexagon({ completedVirtues = [], onVirtueClick, activeVirtue }) {
  const polygonPoints = vertices.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <div className="relative flex items-center justify-center">
      <svg width="320" height="320" viewBox="0 0 320 320">
        <defs>
          {VIRTUES.map((v) => (
            <filter key={v.key} id={`glow-${v.key}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          <filter id="glow-fill" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dark background polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(10,10,20,0.95)"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />

        {/* Completed fill triangles */}
        {VIRTUES.map((virtue, i) => {
          if (!completedVirtues.includes(virtue.key)) return null;
          const [x1, y1] = vertices[i];
          const [x2, y2] = vertices[(i + 1) % 6];
          return (
            <polygon
              key={`fill-${virtue.key}`}
              points={`${CX},${CY} ${x1},${y1} ${x2},${y2}`}
              fill={virtue.color}
              fillOpacity="0.12"
              filter="url(#glow-fill)"
            />
          );
        })}

        {/* Edges - clickable */}
        {VIRTUES.map((virtue, i) => {
          const [x1, y1] = vertices[i];
          const [x2, y2] = vertices[(i + 1) % 6];
          const isCompleted = completedVirtues.includes(virtue.key);
          const isActive = activeVirtue === virtue.key;
          return (
            <g key={virtue.key} onClick={() => onVirtueClick(virtue.key)} style={{ cursor: "pointer" }}>
              {/* Wider invisible hit area */}
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="transparent"
                strokeWidth="20"
              />
              {/* Visible edge */}
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={virtue.color}
                strokeWidth={isActive ? 4 : isCompleted ? 3 : 1.5}
                strokeOpacity={isCompleted ? 1 : isActive ? 0.9 : 0.45}
                filter={isCompleted || isActive ? `url(#glow-${virtue.key})` : undefined}
              />
              {/* Vertex dots */}
              <circle cx={x1} cy={y1} r="3" fill={virtue.color} fillOpacity={isCompleted ? 1 : 0.4} />
            </g>
          );
        })}

        {/* Close the last vertex dot */}
        <circle cx={vertices[0][0]} cy={vertices[0][1]} r="3"
          fill={completedVirtues.includes("wisdom") ? VIRTUES[0].color : VIRTUES[0].color}
          fillOpacity={completedVirtues.includes("wisdom") ? 1 : 0.4}
        />

        {/* Virtue labels */}
        {VIRTUES.map((virtue, i) => {
          const pos = edgeLabelPos(i);
          const angle = edgeAngle(i);
          const isCompleted = completedVirtues.includes(virtue.key);
          return (
            <text
              key={`label-${virtue.key}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={virtue.color}
              fillOpacity={isCompleted ? 1 : 0.5}
              fontSize="7"
              fontWeight="600"
              letterSpacing="1.5"
              fontFamily="monospace"
              transform={`rotate(${angle}, ${pos.x}, ${pos.y})`}
              style={{ cursor: "pointer", userSelect: "none" }}
              onClick={() => onVirtueClick(virtue.key)}
            >
              {virtue.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export { VIRTUES };