"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, LogOut, Trash2, Download, Info, Mail, Shield, Camera, Check } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useTheme } from "@/lib/ThemeContext";
import { useAuth } from "@/lib/AuthContext";

// Since we are decoupling from THEMES export to keep it clean, we'll redefine the essential details here for the UI
const THEME_OPTIONS = [
  { id: "orchid", name: "Sakura", bg: "#F7E9F3", accent: "#2D3142" },
  { id: "glow", name: "Glow", bg: "#050508", accent: "#f3afee" }
];

function SettingsRow({ icon, label, sublabel, onClick, danger, theme }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-4 transition-opacity hover:opacity-80 active:opacity-60 border-0"
      style={{ background: "transparent" }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: danger ? "rgba(255,80,80,0.1)" : theme.inputBg }}
      >
        {React.cloneElement(icon, { size: 16, style: { color: danger ? "#ff6b6b" : theme.accent } })}
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-semibold" style={{ color: danger ? "#ff6b6b" : theme.text }}>{label}</p>
        {sublabel && <p className="text-xs mt-0.5" style={{ color: theme.subText }}>{sublabel}</p>}
      </div>
      <ChevronLeft size={14} className="rotate-180" style={{ color: theme.mutedText }} />
    </button>
  );
}

function Section({ title, children, theme }: any) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold tracking-widest uppercase px-4 mb-2" style={{ color: theme.subText }}>
        {title}
      </p>
      <div className="rounded-2xl overflow-hidden divide-y" style={{ background: theme.isLight ? "#ffffff" : theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
        {children}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { themeId, setTheme, theme } = useTheme();
  const { user, logout } = useAuth();
  
  const [confirmReset, setConfirmReset] = useState(false);
  
  const [nickname, setNickname] = useState("");
  const [photo, setPhoto] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setNickname(localStorage.getItem("profile_nickname") || "");
      setPhoto(localStorage.getItem("profile_photo") || "");
    }
  }, []);
  
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPhoto(dataUrl);
      if (typeof window !== "undefined") localStorage.setItem("profile_photo", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNickname = () => {
    if (typeof window !== "undefined") localStorage.setItem("profile_nickname", nickname);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
  };

  const handleExportData = async () => {
    try {
      const storedKeys = Object.keys(localStorage);
      const data: any = { user: user?.email };
      storedKeys.forEach(k => {
        data[k] = localStorage.getItem(k);
      });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "flourish-data.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const handleResetProgress = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    try {
      if (typeof window !== "undefined") {
        // Clear everything out except themes
        const currentTheme = localStorage.getItem("app_theme");
        localStorage.clear();
        if (currentTheme) localStorage.setItem("app_theme", currentTheme);
      }
      router.push("/daily");
    } catch {}
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: theme.bg, color: theme.text }}>
      <div className="flex items-center justify-between px-4 pb-6 pt-safe">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center border-0"
          style={{ background: theme.inputBg }}
        >
          <ChevronLeft size={18} style={{ color: theme.subText }} />
        </button>
        <h1 className="text-xl font-bold tracking-wide" style={{ color: theme.accent, fontFamily: "var(--font-recoleta)", textShadow: theme.headerGlow ? `0 0 20px ${theme.accent}55` : "none" }}>
          Settings
        </h1>
        <div className="w-9" />
      </div>

      <div className="px-4">
        {/* Profile section */}
        <div className="mb-6">
          <p className="text-xs font-bold tracking-widest uppercase px-4 mb-2" style={{ color: theme.subText }}>Profile</p>
          <div className="rounded-2xl p-5" style={{ background: theme.isLight ? "#ffffff" : theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
            <div className="flex flex-col items-center mb-5">
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
                  style={{ background: photo ? "transparent" : theme.inputBg }}
                >
                  {photo
                    ? <img src={photo} alt="profile" className="w-full h-full object-cover" />
                    : <span className="text-2xl font-bold" style={{ color: theme.accent }}>{nickname?.[0]?.toUpperCase() || "?"}</span>
                  }
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center border-0"
                  style={{ background: theme.accent }}
                >
                  <Camera size={13} style={{ color: theme.isLight ? "#fff" : "#1a0a1a" }} />
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              <p className="text-xs mt-2" style={{ color: theme.mutedText }}>Tap camera to change photo</p>
            </div>

            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: theme.subText }}>How should we call you?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="Enter your name..."
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none border-0"
                  style={{ background: theme.inputBg, color: theme.text }}
                />
                <button
                  onClick={handleSaveNickname}
                  className="px-4 py-2.5 rounded-xl border-0 text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  style={{ background: theme.inputBg, color: saved ? theme.virtueColors?.justice || "#86efac" : theme.accent }}
                >
                  {saved ? <Check size={14} /> : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Theme section */}
        <div className="mb-6">
          <p className="text-xs font-bold tracking-widest uppercase px-4 mb-2" style={{ color: theme.subText }}>Theme</p>
          <div className="rounded-2xl p-4 flex gap-3" style={{ background: theme.isLight ? "#ffffff" : theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
            {THEME_OPTIONS.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className="flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-0 transition-all cursor-pointer"
                style={{ background: themeId === t.id ? theme.inputBg : "transparent" }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: t.bg }}>
                  <div className="w-4 h-4 rounded-full" style={{ background: t.accent }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: themeId === t.id ? theme.accent : theme.subText }}>
                  {t.name}
                </span>
                {themeId === t.id && (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
                )}
              </button>
            ))}
          </div>
        </div>

        <Section title="Account" theme={theme}>
          <SettingsRow theme={theme} icon={<LogOut />} label="Sign Out" sublabel="Log out of your account" onClick={handleLogout} />
        </Section>

        <Section title="Data" theme={theme}>
          <SettingsRow theme={theme} icon={<Download />} label="Export My Data" sublabel="Download your progress as JSON" onClick={handleExportData} />
          <SettingsRow
            theme={theme}
            icon={<Trash2 />}
            label={confirmReset ? "Tap again to confirm" : "Reset All Progress"}
            sublabel={confirmReset ? "This cannot be undone" : "Delete all stats, streaks and history"}
            onClick={handleResetProgress}
            danger
          />
        </Section>

        <Section title="About" theme={theme}>
          <SettingsRow theme={theme} icon={<Info />} label="About Flourish" sublabel="A daily virtue practice app" onClick={() => {}} />
          <SettingsRow theme={theme} icon={<Shield />} label="Privacy" sublabel="Your data stays on your account" onClick={() => {}} />
          <SettingsRow theme={theme} icon={<Mail />} label="Contact Support" sublabel="Get help or send feedback" onClick={() => window.open("mailto:support@flourish.app")} />
        </Section>

        <p className="text-center text-xs mt-4 pb-8" style={{ color: theme.mutedText }}>
          Flourish Next.js v1.0
        </p>
      </div>

      <BottomNav active="profile" />
    </div>
  );
}
