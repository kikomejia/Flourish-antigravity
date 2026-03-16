import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/lib/ThemeContext";

const VIRTUES = [
  { key: "wisdom", label: "WISDOM", color: "#d8b4fe" },
  { key: "courage", label: "COURAGE", color: "#fef08a" },
  { key: "humanity", label: "HUMANITY", color: "#fda4af" },
  { key: "justice", label: "JUSTICE", color: "#86efac" },
  { key: "temperance", label: "TEMPERANCE", color: "#ffedd5" },
  { key: "transcendence", label: "TRANSCENDENCE", color: "#7dd3fc" },
];

// Labels placed outside the petal tips
const PETALS = [
  {
    key: "transcendence",
    d: "M2333.28,2546.38c-0,-0 -982.087,-124.257 -1712.12,-0c-165.13,-6.532 -884.89,-493.869 -471.965,-1263.48c312.729,-547.051 1006.9,-521.347 1308.79,-228.583c430.052,417.047 875.295,1492.06 875.295,1492.06Z",
    labelX: -200, labelY: 1000, anchor: "middle", rotation: -60,
  },
  {
    key: "temperance",
    d: "M2334.82,2548.81c0,-0 -598.949,788.158 -856.619,1482.42c-88.274,139.707 -870.343,519.075 -1330.1,-223.507c-317.191,-544.476 52.375,-1132.65 456.906,-1247.57c576.262,-163.696 1729.82,-11.345 1729.82,-11.345Z",
    labelX: -200, labelY: 4100, anchor: "middle", rotation: 60,
  },
  {
    key: "justice",
    d: "M2329.99,2550.11c-0,0 384.089,912.365 857.126,1482.13c77.012,146.216 15.469,1013.26 -857.476,1041.09c-630.122,3.148 -955.387,-610.639 -853.086,-1018.54c145.73,-581.065 853.436,-1504.67 853.436,-1504.67Z",
    labelX: 2333, labelY: 5620, anchor: "middle", rotation: 0,
  },
  {
    key: "humanity",
    d: "M2333.28,2549.14c-0,-0 982.063,124.437 1712.12,0.315c165.128,6.562 884.798,494.032 471.732,1263.57c-312.829,546.994 -1006.99,521.162 -1308.83,228.342c-429.975,-417.126 -875.02,-1492.22 -875.02,-1492.22Z",
    labelX: 4866, labelY: 4100, anchor: "middle", rotation: -60,
  },
  {
    key: "courage",
    d: "M2330.64,2551.1c0,0 599.991,-787.366 858.578,-1481.29c88.459,-139.59 871.028,-517.923 1329.81,225.266c316.471,544.894 -53.873,1132.58 -458.555,1246.96c-576.477,162.934 -1729.83,9.059 -1729.83,9.059Z",
    labelX: 4866, labelY: 1000, anchor: "middle", rotation: 60,
  },
  {
    key: "wisdom",
    d: "M2337.22,2546.38c0,-0 -384.778,-912.075 -858.245,-1481.48c-77.124,-146.159 -16.235,-1013.25 856.688,-1041.74c630.12,-3.624 955.849,609.918 853.856,1017.9c-145.291,581.174 -852.299,1505.32 -852.299,1505.32Z",
    labelX: 2333, labelY: -524, anchor: "middle", rotation: 0,
  },
];

export default function VirtueHexagon({ completedVirtues = [], acceptedVirtues = [], onVirtueClick, activeVirtue, showPrompt = true }) {
  const { theme } = useTheme();
  const [pulseKey, setPulseKey] = React.useState(0);
  const [isPulsing, setIsPulsing] = React.useState(false);
  const prevActiveVirtue = React.useRef(null);

  React.useEffect(() => {
    if (activeVirtue && activeVirtue !== prevActiveVirtue.current) {
      setPulseKey(k => k + 1);
      setIsPulsing(true);
      const t = setTimeout(() => setIsPulsing(false), 400);
      prevActiveVirtue.current = activeVirtue;
      return () => clearTimeout(t);
    }
    if (!activeVirtue) prevActiveVirtue.current = null;
  }, [activeVirtue]);

  const activeVirtueData = activeVirtue ? VIRTUES.find(v => v.key === activeVirtue) : null;

  return (
    <div className="flex flex-col items-center justify-center">
      <svg
        width="307" height="348" viewBox="-600 -500 5867 6200"
        style={{
          overflow: "visible",
          transform: isPulsing ? "scale(1.045)" : "scale(1)",
          transition: isPulsing ? "transform 0.12s ease-out" : "transform 0.28s ease-out",
        }}
      >
        <defs>
          {VIRTUES.map((v) => (
            <filter key={v.key} id={`glow-pw-${v.key}`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="80" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Pulsing glow circle in center when a virtue is active */}


        {PETALS.map((petal) => {
          const virtue = { ...VIRTUES.find((v) => v.key === petal.key), color: theme.virtueColors[petal.key] || VIRTUES.find(v => v.key === petal.key)?.color };
          const isCompleted = completedVirtues.includes(petal.key);
          const isAccepted = acceptedVirtues.includes(petal.key);
          const isActive = activeVirtue === petal.key;

          return (
            <g key={petal.key} onClick={() => onVirtueClick(petal.key)} style={{ cursor: "pointer" }}>
              <path
                d={petal.d}
                fill={isCompleted ? `${virtue.color}20` : isAccepted ? `${virtue.color}0e` : "rgba(10,10,20,0.6)"}
                stroke={virtue.color}
                strokeWidth={isActive ? 90 : isCompleted ? 75 : isAccepted ? 65 : 46.3}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={isCompleted ? 1 : isActive ? 1 : isAccepted ? 0.95 : 0.7}
                filter={isActive || isAccepted || isCompleted ? `url(#glow-pw-${petal.key})` : undefined}
                style={{ transition: "all 0.3s ease" }}
              />
            </g>
          );
        })}

        {/* Decorative accent line on transcendence */}
        <path
          d="M2333.28,2546.38c-76.921,-226.496 -616.856,-1290.84 -908.264,-1521.33"
          fill="none"
          stroke="#7dd3fc"
          strokeWidth="46.3"
          strokeLinecap="round"
          strokeOpacity="0.4"
          style={{ pointerEvents: "none" }}
        />
      </svg>
    </div>
  );
}

export { VIRTUES };