import React from "react";
import VIRTUE_CONTENT from "./virtueContent";

export const VIRTUE_DEFINITIONS = {
  wisdom: "The ability to see things as they really are and use that clarity to make better choices.",
};

export const VIRTUE_CULTIVATE = {
  wisdom: "Cultivate Judgement, Creativity, Love of Learning, Perspective and Curiosity",
};

export const VIRTUE_COLORS = {
  wisdom: "#d8b4fe",
  courage: "#fef08a",
  humanity: "#fda4af",
  justice: "#86efac",
  temperance: "#ffedd5",
  transcendence: "#7dd3fc",
};

function seededRandom(seed) {
  let s = seed;
  s = (s ^ 0xdeadbeef) >>> 0;
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
  s = (s ^ (s >>> 16)) >>> 0;
  return s / 0xffffffff;
}

export function getDailyItem(virtue, offset = 0) {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const seed = dayOfYear * 100 + Object.keys(VIRTUE_CONTENT).indexOf(virtue) + offset * 1000;

  const content = VIRTUE_CONTENT[virtue];
  const allItems = [
    ...content.pledges.map(p => ({ ...p, type: "pledge" })),
    ...content.challenges.map(c => ({ ...c, type: "challenge" })),
  ];

  const idx = Math.floor(seededRandom(seed) * allItems.length);
  return allItems[idx];
}

export const MAX_CHANGES = 3;

export default function VirtueCard({ virtue, isCompleted, onComplete, changeCount, onChange }) {
  const color = VIRTUE_COLORS[virtue];
  const item = getDailyItem(virtue, changeCount ?? 0);
  const canChange = (changeCount ?? 0) < MAX_CHANGES;

  return (
    <div className="rounded-2xl p-5 transition-all duration-300" style={{ background: "rgba(10,10,20,0.9)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-md"
          style={{ background: `${color}22`, color, border: `1px solid ${color}66` }}
        >
          {virtue}
        </span>
        <span className="text-sm italic" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "serif" }}>
          {item?.type}
        </span>
        {isCompleted && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}>
            Done
          </span>
        )}
      </div>

      {/* Content */}
      <p className="text-white font-bold text-xl mb-3 leading-snug">{item?.title}</p>
      <p className="text-white/60 text-sm leading-relaxed mb-6">{item?.text}</p>

      {/* Actions */}
      {!isCompleted && (
        <div className="flex gap-3">
          <button
            onClick={canChange ? onChange : undefined}
            className="flex-1 py-3 rounded-full text-sm font-semibold transition-all duration-200"
            style={{
              background: "transparent",
              color: canChange ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)",
              border: `1.5px solid ${canChange ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)"}`,
              cursor: canChange ? "pointer" : "not-allowed",
            }}
          >
            Change {(changeCount ?? 0) > 0 && <span style={{ opacity: 0.5, fontSize: "0.7rem" }}>({changeCount}/{MAX_CHANGES})</span>}
          </button>
          <button
            onClick={() => onComplete(virtue)}
            className="flex-1 py-3 rounded-full text-sm font-bold transition-all duration-200"
            style={{
              background: color,
              color: "#0a0a14",
              boxShadow: `0 0 20px ${color}66`,
              cursor: "pointer",
            }}
          >
            Accept
          </button>
        </div>
      )}
    </div>
  );
}