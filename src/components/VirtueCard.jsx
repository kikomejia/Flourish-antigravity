import React from "react";
import { CheckCircle, Circle } from "lucide-react";
import VIRTUE_CONTENT from "./virtueContent";

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

export default function VirtueCard({ virtue, isCompleted, onComplete, accepted, onAccept, changeCount, onChange }) {
  const color = VIRTUE_COLORS[virtue];
  const item = getDailyItem(virtue, changeCount ?? 0);
  const canChange = (changeCount ?? 0) < MAX_CHANGES;

  return (
    <div className="rounded-xl p-5 transition-all duration-300" style={{ background: "rgba(10,10,20,0.9)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold tracking-widest uppercase" style={{ color, fontFamily: "monospace" }}>
            {virtue}
          </h3>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: `${color}15`, color, border: `1px solid ${color}40` }}
          >
            {item?.type}
          </span>
        </div>
        {isCompleted && (
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}>
            Done
          </span>
        )}
      </div>

      <p className="text-white/90 font-semibold text-sm mb-2">{item?.title}</p>
      <p className="text-white/70 text-sm leading-relaxed mb-4">{item?.text}</p>

      {!isCompleted && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-white/60 hover:text-white/90 transition-colors">
            <input
              type="checkbox"
              checked={!!accepted}
              onChange={(e) => onAccept?.(e.target.checked)}
              className="hidden"
            />
            {accepted ? (
              <CheckCircle size={16} style={{ color }} />
            ) : (
              <Circle size={16} className="opacity-40" />
            )}
            I accept this {item?.type}
          </label>

          <div className="flex gap-2">
            <button
              onClick={canChange ? onChange : undefined}
              disabled={!canChange}
              className="flex-1 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                color: canChange ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.18)",
                border: `1px solid ${canChange ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"}`,
                cursor: canChange ? "pointer" : "not-allowed",
              }}
            >
              Change
              <span className="ml-1.5 text-xs" style={{ opacity: 0.5 }}>
                {changeCount ?? 0}/{MAX_CHANGES}
              </span>
            </button>
            <button
              onClick={() => { if (accepted) onComplete(virtue); }}
              disabled={!accepted}
              className="flex-1 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200"
              style={{
                background: accepted ? `${color}22` : "rgba(255,255,255,0.03)",
                color: accepted ? color : "rgba(255,255,255,0.2)",
                border: `1px solid ${accepted ? color + "66" : "rgba(255,255,255,0.05)"}`,
                cursor: accepted ? "pointer" : "not-allowed",
                boxShadow: accepted ? `0 0 12px ${color}33` : "none",
              }}
            >
              Complete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}