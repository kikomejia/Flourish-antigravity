"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const THEMES = {
  orchid: {
    id: "orchid",
    name: "Sakura",
    bg: "#F7E9F3",
    accent: "#2D3142",
    text: "#2D3142",
    subText: "rgba(45,49,66,0.75)",
    mutedText: "rgba(45,49,66,0.55)",
    cardBg: "rgba(255,220,252,0.75)",
    cardBorder: "transparent",
    inputBg: "rgba(45,49,66,0.06)",
    headerGlow: false,
    cardGlow: false,
    calendarGlow: false,
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
    headerGlow: true,
    cardGlow: true,
    calendarGlow: true,
    pillFilled: false,
    pillTextColor: null,
    isLight: false,
    virtueColors: {
      wisdom: "#d8b4fe",
      courage: "#fef08a",
      humanity: "#fda4af",
      justice: "#86efac",
      temperance: "#ffedd5",
      transcendence: "#38bdf8",
    },
  }
};

export function getPillStyle(theme: any, virtueColor: string) {
  if (theme.pillFilled) {
    return {
      background: virtueColor,
      color: theme.pillTextColor || "#fff",
      border: "none",
    };
  }
  return {
    background: `${virtueColor}18`,
    color: virtueColor,
    border: `1.5px solid ${virtueColor}88`,
  };
}

export function getActionButtonStyle(theme: any, virtueColor: string) {
  if (theme.pillFilled) {
    return {
      background: virtueColor,
      color: theme.pillTextColor || "#fff",
      boxShadow: "none",
    };
  }
  return {
    background: virtueColor,
    color: "#000",
    boxShadow: `0 0 20px ${virtueColor}66`,
  };
}

export function getChallengeButtonStyle(theme: any, virtueColor: string) {
  if (theme.pillFilled) {
    return {
      background: virtueColor,
      color: theme.pillTextColor || "#fff",
      boxShadow: "none",
    };
  }
  return {
    background: `${virtueColor}18`,
    color: virtueColor,
    border: `1.5px solid ${virtueColor}88`,
    boxShadow: `0 0 14px ${virtueColor}33`,
  };
}

const ThemeContext = createContext<any>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState("orchid");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("app_theme");
    if (stored) setThemeId(stored);
  }, []);

  const theme = THEMES[themeId as keyof typeof THEMES] || THEMES.orchid;

  const setTheme = (id: string) => {
    setThemeId(id);
    localStorage.setItem("app_theme", id);
  };

  useEffect(() => {
    if (!mounted) return;
    const bg = theme.bg;
    document.documentElement.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;
  }, [theme.bg, mounted]);

  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { theme: THEMES.orchid, themeId: "orchid", setTheme: () => {} };
  return ctx;
}
