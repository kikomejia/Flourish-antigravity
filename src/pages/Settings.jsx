import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, LogOut, Trash2, Download, Info, Mail, Shield, Camera, Check } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useTheme, THEMES } from "@/lib/ThemeContext";

function SettingsRow({ icon, label, sublabel, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-4 transition-opacity hover:opacity-80 active:opacity-60"
      style={{ background: "transparent" }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: danger ? "rgba(255,80,80,0.1)" : "rgba(243,175,238,0.08)",
          border: `1px solid ${danger ? "rgba(255,80,80,0.25)" : "rgba(243,175,238,0.15)"}`,
        }}
      >
        {React.cloneElement(icon, { size: 16, style: { color: danger ? "#ff6b6b" : "#f3afee" } })}
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-semibold" style={{ color: danger ? "#ff6b6b" : "rgba(255,255,255,0.9)" }}>{label}</p>
        {sublabel && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{sublabel}</p>}
      </div>
      <ChevronLeft size={14} className="rotate-180" style={{ color: "rgba(255,255,255,0.2)" }} />
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold tracking-widest uppercase px-4 mb-2" style={{ color: "rgba(243,175,238,0.5)" }}>
        {title}
      </p>
      <div
        className="rounded-2xl overflow-hidden divide-y"
        style={{
          background: "rgba(15,5,25,0.95)",
          border: "1px solid rgba(243,175,238,0.12)",
          divideColor: "rgba(255,255,255,0.05)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { themeId, setTheme, theme } = useTheme();
  const [confirmReset, setConfirmReset] = useState(false);
  const [nickname, setNickname] = useState(() => localStorage.getItem("profile_nickname") || "");
  const [photo, setPhoto] = useState(() => localStorage.getItem("profile_photo") || "");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setPhoto(dataUrl);
      localStorage.setItem("profile_photo", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNickname = () => {
    localStorage.setItem("profile_nickname", nickname);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleExportData = async () => {
    try {
      const u = await base44.auth.me();
      if (!u?.email) return;
      const [stats, activities] = await Promise.all([
        base44.entities.UserStats.filter({ user_email: u.email }),
        base44.entities.ActivityLog.filter({ user_email: u.email }, "-created_date", 500),
      ]);
      const data = { user: { email: u.email, name: u.full_name }, stats: stats[0] || {}, activities };
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
      const u = await base44.auth.me();
      if (u?.email) {
        const [stats, activities, progress] = await Promise.all([
          base44.entities.UserStats.filter({ user_email: u.email }),
          base44.entities.ActivityLog.filter({ user_email: u.email }),
          base44.entities.DailyProgress.filter({ user_email: u.email }),
        ]);
        await Promise.all([
          ...stats.map(s => base44.entities.UserStats.delete(s.id)),
          ...activities.map(a => base44.entities.ActivityLog.delete(a.id)),
          ...progress.map(p => base44.entities.DailyProgress.delete(p.id)),
        ]);
      }
      localStorage.clear();
      navigate("/Daily");
    } catch {}
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: theme.bg, color: theme.text }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <ChevronLeft size={18} style={{ color: "rgba(255,255,255,0.7)" }} />
        </button>
        <h1 className="text-xl font-bold tracking-wide" style={{ color: theme.accent, fontFamily: "serif", textShadow: `0 0 20px ${theme.accent}55` }}>
          Settings
        </h1>
        <div className="w-9" />
      </div>

      <div className="px-4">
        {/* Profile section */}
        <div className="mb-6">
          <p className="text-xs font-bold tracking-widest uppercase px-4 mb-2" style={{ color: "rgba(243,175,238,0.5)" }}>Profile</p>
          <div className="rounded-2xl p-5" style={{ background: "rgba(15,5,25,0.95)", border: "1px solid rgba(243,175,238,0.12)" }}>
            {/* Photo */}
            <div className="flex flex-col items-center mb-5">
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
                  style={{
                    background: photo ? "transparent" : "linear-gradient(135deg, #e879f933, #60efff33)",
                    border: "2px solid rgba(243,175,238,0.45)",
                    boxShadow: "0 0 28px rgba(243,175,238,0.18)",
                  }}
                >
                  {photo
                    ? <img src={photo} alt="profile" className="w-full h-full object-cover" />
                    : <span className="text-2xl font-bold">{nickname?.[0]?.toUpperCase() || "?"}</span>
                  }
                </div>
                <button
                  onClick={() => fileRef.current.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: "#f3afee", boxShadow: "0 0 10px #f3afee88" }}
                >
                  <Camera size={13} style={{ color: "#1a0a1a" }} />
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>Tap camera to change photo</p>
            </div>

            {/* Nickname */}
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>How should we call you?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="Enter your name..."
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(243,175,238,0.2)",
                    color: "white",
                  }}
                />
                <button
                  onClick={handleSaveNickname}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all"
                  style={{ background: saved ? "rgba(134,239,172,0.2)" : "#f3afee22", border: `1px solid ${saved ? "#86efac88" : "#f3afee55"}`, color: saved ? "#86efac" : "#f3afee" }}
                >
                  {saved ? <Check size={14} /> : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Theme section */}
        <div className="mb-6">
          <p className="text-xs font-bold tracking-widest uppercase px-4 mb-2" style={{ color: "rgba(243,175,238,0.5)" }}>Theme</p>
          <div className="rounded-2xl p-4 flex gap-3" style={{ background: "rgba(15,5,25,0.95)", border: "1px solid rgba(243,175,238,0.12)" }}>
            {Object.values(THEMES).map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className="flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-xl transition-all"
                style={{
                  background: themeId === t.id ? "rgba(243,175,238,0.1)" : "transparent",
                  border: `1.5px solid ${themeId === t.id ? "rgba(243,175,238,0.5)" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                {/* Mini preview */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: t.bg, border: `2px solid ${t.accent}` }}>
                  <div className="w-4 h-4 rounded-full" style={{ background: t.accent }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: themeId === t.id ? "#f3afee" : "rgba(255,255,255,0.4)" }}>
                  {t.name}
                </span>
                {themeId === t.id && (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#f3afee" }} />
                )}
              </button>
            ))}
          </div>
        </div>

        <Section title="Account">
          <SettingsRow icon={<LogOut />} label="Sign Out" sublabel="Log out of your account" onClick={handleLogout} />
        </Section>

        <Section title="Data">
          <SettingsRow icon={<Download />} label="Export My Data" sublabel="Download your progress as JSON" onClick={handleExportData} />
          <SettingsRow
            icon={<Trash2 />}
            label={confirmReset ? "Tap again to confirm" : "Reset All Progress"}
            sublabel={confirmReset ? "This cannot be undone" : "Delete all stats, streaks and history"}
            onClick={handleResetProgress}
            danger
          />
        </Section>

        <Section title="About">
          <SettingsRow icon={<Info />} label="About Flourish" sublabel="A daily virtue practice app" onClick={() => {}} />
          <SettingsRow icon={<Shield />} label="Privacy" sublabel="Your data stays on your account" onClick={() => {}} />
          <SettingsRow icon={<Mail />} label="Contact Support" sublabel="Get help or send feedback" onClick={() => window.open("mailto:support@flourish.app")} />
        </Section>

        <p className="text-center text-xs mt-4" style={{ color: "rgba(255,255,255,0.15)" }}>
          Flourish v1.0
        </p>
      </div>

      <BottomNav />
    </div>
  );
}