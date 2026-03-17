import React from "react";
import VIRTUE_CONTENT from "./virtueContent";
import { useTheme } from "@/lib/ThemeContext";

export const VIRTUE_DEFINITIONS = {
  wisdom: "Cultivate your knowledge and experience to improve your decision-making.",
  courage: "Build the mental strength to value what is right more than the comfort of staying safe.",
  humanity: "Practice acting with kindness and care to build strong, reliable relationships.",
  justice: "Commit to doing your fair share and ensuring others are treated with the same rules and respect.",
  temperance: "Practice managing your impulses and habits so they don't get in the way of your long-term goals.",
  transcendence: "Seek specific reasons to be hopeful and grateful in your everyday environment.",
};

export const VIRTUE_CULTIVATE = {
  wisdom: "Cultivate Judgement, Creativity, Love of Learning, Perspective and Curiosity",
  courage: "Cultivate Honesty, Bravery, Perseverance and Zest",
  humanity: "Cultivate Love, Kindness and Social Intelligence",
  justice: "Cultivate Fairness, Leadership and Teamwork",
  temperance: "Cultivate Prudence, Humility, Self-Regulation and Forgiveness",
  transcendence: "Cultivate Appreciation of Beauty and Excellence, Gratitude, Humor and Hope",
};

export const VIRTUE_COLORS = {
  wisdom: "#d8b4fe",
  courage: "#fef08a",
  humanity: "#fda4af",
  justice: "#86efac",
  temperance: "#ffedd5",
  transcendence: "#38bdf8",
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
  const items = content.pledges.map(p => ({ ...p, type: "pledge" }));

  const idx = Math.floor(seededRandom(seed) * items.length);
  return items[idx];
}

export function getDailyChallenge(virtue, offset = 0) {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const seed = dayOfYear * 77 + Object.keys(VIRTUE_CONTENT).indexOf(virtue) + offset * 999;

  const content = VIRTUE_CONTENT[virtue];
  const items = content.challenges.map(c => ({ ...c, type: "challenge" }));

  const idx = Math.floor(seededRandom(seed) * items.length);
  return items[idx];
}

export const MAX_CHANGES = 3;

export default function VirtueCard({ virtue, isCompleted, onComplete, changeCount, onChange }) {
  const { theme } = useTheme();
  const color = theme.virtueColors[virtue] || VIRTUE_COLORS[virtue];
  const item = getDailyItem(virtue, changeCount ?? 0);
  const canChange = (changeCount ?? 0) < MAX_CHANGES;

  const isLight = theme.isLight;

  return (
    <div className="rounded-2xl p-5 transition-all duration-300" style={{ background: theme.cardBg, border: "none" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-md"
          style={{ background: color, color: "#fff" }}
        >
          {virtue}
        </span>
        <span className="text-sm italic" style={{ color: theme.subText, fontFamily: "serif" }}>
          Today's pledge
        </span>
      </div>

      {/* Content */}
      <p className="font-bold text-xl mb-3 leading-snug" style={{ color: theme.text }}>{item?.title}</p>
      <p className="text-sm leading-relaxed mb-6" style={{ color: theme.subText }}>{item?.text}</p>

      {/* Actions */}
      {!isCompleted ? (
        <div className="flex gap-3">
          <button
            onClick={canChange ? onChange : undefined}
            className="flex-1 py-3 rounded-full text-sm font-semibold transition-all duration-200"
            style={{
              background: "transparent",
              color: canChange ? theme.subText : theme.mutedText,
              border: `1.5px solid ${canChange ? theme.cardBorder : "rgba(0,0,0,0.05)"}`,
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
              color: isLight ? "#fff" : "#0a0a14",
              boxShadow: `0 0 20px ${color}66`,
              cursor: "pointer",
            }}
          >
            Accept
          </button>
        </div>
      ) : (
        <div
          className="w-full py-3 rounded-full text-sm font-bold text-center"
          style={{ background: `${color}22`, color: isLight ? theme.accent : color }}
        >
          Accepted +1
        </div>
      )}
    </div>
  );
}