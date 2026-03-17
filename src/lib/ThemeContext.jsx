import React, { createContext, useContext, useState, useEffect } from "react";

export const THEMES = {
  glow: {
    id: "glow",
    name: "Glow",
    bg: "#050508",
    accent: "#f3afee",
    text: "rgba(255,255,255,0.9)",
    subText: "rgba(255,255,255,0.45)",
    mutedText: "rgba(255,255,255,0.25)",
    cardBg: "rgba(10,10,20,0.9)",
    cardBorder: "rgba(243,175,238,0.12)",
    inputBg: "rgba(255,255,255,0.05)",
    isLight: false,
    virtueColors: {
      wisdom: "#d8b4fe",
      courage: "#fef08a",
      humanity: "#fda4af",
      justice: "#86efac",
      temperance: "#ffedd5",
      transcendence: "#67e8c8",
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
    isLight: true,
    virtueColors: {
      wisdom: "#8E44AD",
      courage: "#C07000",
      humanity: "#C0356A",
      justice: "#1A7A4A",
      temperance: "#4F5D75",
      transcendence: "#0A8A7A",
    },
  },
};

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
  return useContext(ThemeContext);
}