"use client";

import React from "react";
import { useTheme } from "@/lib/ThemeContext";

export default function ProgressBar({ value, max }: { value: number; max: number }) {
  const { theme } = useTheme();
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: theme.inputBg }}>
      <div 
        className="h-full rounded-full transition-all duration-500 ease-out" 
        style={{ width: `${percentage}%`, background: theme.accent }} 
      />
    </div>
  );
}
