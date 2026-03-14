import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, LogOut, Trash2, Download, Info, Mail, Shield } from "lucide-react";
import BottomNav from "@/components/BottomNav";

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
  const [confirmReset, setConfirmReset] = useState(false);

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
    <div className="min-h-screen pb-28" style={{ background: "#050508", color: "white" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <ChevronLeft size={18} style={{ color: "rgba(255,255,255,0.7)" }} />
        </button>
        <h1 className="text-xl font-bold tracking-wide" style={{ color: "#f3afee", fontFamily: "serif", textShadow: "0 0 20px #f3afee55" }}>
          Settings
        </h1>
        <div className="w-9" />
      </div>

      <div className="px-4">
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