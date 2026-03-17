import React, { createContext, useContext, useState } from "react";

export const THEMES = {
  glow: {
    id: "glow",
    name: "Glow",
    bg: "#050508",
    accent: "#f3afee",
    text: "rgba(255,255,255,0.9)",
    subText: "rgba(255,255,255,0.45)",
    mutedText: "rgba(255,255,255,0.25)",
    cardBg: "rgba(20,10,30,0.95)",
    cardBorder: "rgba(243,175,238,0.15)",
    inputBg: "rgba(255,255,255,0.05)",
    // Pills in glow: dark bg with colored border and colored text (outlined style)
    pillFilled: false,
    pillTextColor: null, // will use virtue color per-pill
    isLight: false,
    virtueColors: {
      wisdom: "#d8b4fe",
      courage: "#fef08a",
      humanity: "#fda4af",
      justice: "#86efac",
      temperance: "#ffedd5",
      transcendence: "#38bdf8",
    },
  },
  orchid: {
    id: "orchid",
    name: "Orchid Pink",
    bg: "#F3AFEE",
    accent: "#2D3142",
    text: "#2D3142",
    subText: "rgba(45,49,66,0.65)",
    mutedText: "rgba(45,49,66,0.35)",
    cardBg: "rgba(255,220,252,0.75)",
    cardBorder: "rgba(45,49,66,0.15)",
    inputBg: "rgba(45,49,66,0.06)",
    // Pills in orchid: filled with virtue color, white text
    pillFilled: true,
    pillTextColor: "#fff",
    isLight: true,
    virtueColors: {
      wisdom: "#8E44AD",
      courage: "#C07000",
      humanity: "#C0356A",
      justice: "#1A7A4A",
      temperance: "#4F5D75",
      transcendence: "#1565C0",
    },
  },
};

/**
 * Returns the style for a virtue pill/badge.
 * Glow: dark bg with soft transparent virtue fill, colored border + colored text
 * Orchid: filled with virtue color, white text
 */
export function getPillStyle(theme, virtueColor) {
  if (theme.pillFilled) {
    return {
      background: virtueColor,
      color: theme.pillTextColor || "#fff",
      border: "none",
    };
  }
  // Glow: soft transparent fill with colored border
  return {
    background: `${virtueColor}18`,
    color: virtueColor,
    border: `1.5px solid ${virtueColor}88`,
  };
}

/**
 * Returns style for a primary action button (Accept / Take this challenge / Mark Complete).
 * Both themes: filled with virtue color. Glow uses white text, Orchid uses pillTextColor.
 */
export function getActionButtonStyle(theme, virtueColor) {
  return {
    background: virtueColor,
    color: theme.pillFilled ? (theme.pillTextColor || "#fff") : "#fff",
    boxShadow: theme.pillFilled ? "none" : `0 0 20px ${virtueColor}66`,
  };
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => localStorage.getItem("app_theme") || "glow");

  const theme = THEMES[themeId] || THEMES.glow;

  const setTheme = (id) => {
    setThemeId(id);
    localStorage.setItem("app_theme", id);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { theme: THEMES.glow, themeId: "glow", setTheme: () => {} };
  return ctx;
}