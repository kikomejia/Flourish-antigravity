import React, { createContext, useContext, useState, useEffect } from "react";

export const THEMES = {
  glow: {
    id: "glow",
    name: "Glow",
    bg: "#050508",
    accent: "#f3afee",
    text: "rgba(255,255,255,0.9)",
    virtueColors: {
      wisdom: "#d8b4fe",
      courage: "#fef08a",
      humanity: "#fda4af",
      justice: "#86efac",
      temperance: "#ffedd5",
      transcendence: "#7dd3fc",
    },
  },
  orchid: {
    id: "orchid",
    name: "Orchid Pink",
    bg: "#F3AFEE",
    accent: "#2D3142",
    text: "#2D3142",
    virtueColors: {
      wisdom: "#8E44AD",
      courage: "#A8E6CF",
      humanity: "#F7F9FB",
      justice: "#FF8B94",
      temperance: "#4F5D75",
      transcendence: "#FFD166",
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