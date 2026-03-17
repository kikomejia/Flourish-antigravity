import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useTheme, getPillStyle } from "@/lib/ThemeContext";
import { format } from "date-fns";
import { Flame, CheckCircle2, Shield, Sparkles, Lightbulb, Heart, Scale, Leaf, Settings, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { VIRTUE_COLORS } from "@/components/VirtueCard";

const VIRTUES = [
  { key: "wisdom", label: "Wisdom", color: "#d8b4fe", Icon: Lightbulb },
  { key: "courage", label: "Courage", color: "#fef08a", Icon: Shield },
  { key: "humanity", label: "Humanity", color: "#fda4af", Icon: Heart },
  { key: "justice", label: "Justice", color: "#86efac", Icon: Scale },
  { key: "temperance", label: "Temperance", color: "#ffedd5", Icon: Leaf },
  { key: "transcendence", label: "Transcendence", color: "#38bdf8", Icon: Sparkles },
];

function StatCard({ icon, label, children, theme }) {
  const cardStyle = theme.cardGlow
    ? { background: theme.cardBg, border: `1px solid ${theme.accent}55`, boxShadow: `0 0 16px ${theme.accent}22` }
    : { background: theme.cardBg, border: "none" };
  return (
    <div
      className="rounded-2xl p-4"
      style={cardStyle}
    >
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-xs font-medium" style={{ color: theme.subText }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

export default function You() {
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const profileNickname = localStorage.getItem("profile_nickname") || "";
  const profilePhoto = localStorage.getItem("profile_photo") || "";

  useEffect(() => {
    const init = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        if (u?.email) {
          const [statsArr, acts] = await Promise.all([
            base44.entities.UserStats.filter({ user_email: u.email }),
            base44.entities.ActivityLog.filter({ user_email: u.email }, "-created_date", 100),
          ]);
          setStats(statsArr[0] || { total_points: 0, current_streak: 0 });
          setActivities(acts);
        } else {
          const guestStats = JSON.parse(localStorage.getItem("guest_stats") || "{}");
          const guestActs = JSON.parse(localStorage.getItem("guest_activities") || "[]");
          setStats({ total_points: 0, current_streak: 0, ...guestStats });
          setActivities(guestActs);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        setUser(null);
        const guestStats = JSON.parse(localStorage.getItem("guest_stats") || "{}");
        const guestActs = JSON.parse(localStorage.getItem("guest_activities") || "[]");
        setStats({ total_points: 0, current_streak: 0, ...guestStats });
        setActivities(guestActs);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const totalPoints = stats?.total_points || 0;
  const level = Math.floor(totalPoints / 100) + 1;
  const pointsInLevel = totalPoints % 100;

  const challengesDone = activities.filter(a => a.activity_type === "challenge").length;
  const pledgesDone = activities.filter(a => a.activity_type === "pledge").length;

  const filteredActivities = activeFilter
    ? activities.filter(a => a.virtue === activeFilter)
    : activities;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#050508" }}>
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: theme.bg, color: theme.text }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-2" style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}>
        <button
          onClick={() => navigate("/Settings")}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: theme.inputBg, border: `1px solid ${theme.cardBorder}` }}
        >
          <Settings size={15} className="opacity-50" />
        </button>
        <h1 className="text-lg font-semibold tracking-wide" style={{ color: theme.accent, fontFamily: "serif", textShadow: theme.headerGlow ? `0 0 20px ${theme.accent}55` : "none" }}>
          Profile
        </h1>
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: theme.inputBg, border: `1px solid ${theme.cardBorder}` }}
        >
          <Share2 size={15} className="opacity-50" />
        </button>
      </div>

      {/* Avatar + Name */}
      <div className="flex flex-col items-center pt-4 pb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-3 overflow-hidden"
          style={{
            background: profilePhoto ? "transparent" : theme.inputBg,
            border: `2px solid ${theme.accent}${theme.isLight ? "55" : "99"}`,
            boxShadow: theme.isLight ? "none" : `0 0 20px ${theme.accent}44`,
          }}
        >
          {profilePhoto
            ? <img src={profilePhoto} alt="profile" className="w-full h-full object-cover" />
            : (profileNickname?.[0]?.toUpperCase() || user?.full_name?.[0]?.toUpperCase() || "?")}
        </div>
        <h2 className="text-xl font-bold" style={{ color: theme.text }}>{profileNickname || user?.full_name || "Seeker"}</h2>
        <p className="text-sm mt-1" style={{ color: theme.subText }}>
          Level {level} • Path of Wisdom
        </p>
      </div>

      <div className="px-4 space-y-4">
        {/* 2x2 Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard theme={theme} icon={<Flame size={15} style={{ color: theme.isLight ? "#c0356a" : "#ff6b6b" }} />} label="Streak">
            <p className="text-xl font-bold" style={{ color: theme.text }}>{stats?.current_streak || 0} <span className="text-base">Days</span></p>
          </StatCard>

          <StatCard theme={theme} icon={<CheckCircle2 size={15} style={{ color: theme.virtueColors.justice }} />} label="Challenges">
            <p className="text-xl font-bold" style={{ color: theme.text }}>{challengesDone} <span className="text-base">Done</span></p>
          </StatCard>

          <StatCard theme={theme} icon={<Shield size={15} style={{ color: theme.virtueColors.humanity }} />} label="Pledges">
            <p className="text-xl font-bold" style={{ color: theme.text }}>{pledgesDone} <span className="text-base">Done</span></p>
          </StatCard>

          <StatCard theme={theme} icon={<Sparkles size={15} style={{ color: theme.accent }} />} label="Progress">
            <div className="h-2 rounded-full overflow-hidden mb-1.5" style={{ background: theme.inputBg }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pointsInLevel}%`, background: theme.accent }}
              />
            </div>
            <p className="text-xs text-right" style={{ color: theme.mutedText }}>{pointsInLevel} / 100</p>
          </StatCard>
        </div>

        {/* Activity History */}
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold" style={{ color: theme.text }}>Activity History</h3>
            <button
              onClick={() => setActiveFilter(null)}
              className="text-sm transition-colors"
              style={{ color: activeFilter ? theme.accent : theme.mutedText }}
            >
              See all
            </button>
          </div>

          {/* Virtue filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {VIRTUES.map(v => {
              const isActive = activeFilter === v.key;
              const vColor = theme.virtueColors[v.key] || v.color;
              return (
                <button
                  key={v.key}
                  onClick={() => setActiveFilter(isActive ? null : v.key)}
                  className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200"
                  style={isActive
                    ? getPillStyle(theme, vColor)
                    : { background: "transparent", color: theme.subText, border: `1px solid ${theme.pillFilled ? `${vColor}40` : "rgba(255,255,255,0.15)"}` }
                  }
                >
                  {v.label}
                </button>
              );
            })}
          </div>

          {/* Activity list */}
          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <p className="text-center py-10 text-sm" style={{ color: theme.mutedText }}>
                No activities yet
              </p>
            ) : (
              filteredActivities.map(act => {
                const virtue = VIRTUES.find(v => v.key === act.virtue);
                const Icon = virtue?.Icon || Sparkles;
                const color = theme.virtueColors[act.virtue] || virtue?.color || theme.accent;
                const timeStr = act.created_date ? format(new Date(act.created_date), "hh:mm a") : "";

                let actionLabel;
                if (act.activity_type === "pledge") {
                  actionLabel = "Accepted Pledge";
                } else if (act.action === "completed") {
                  actionLabel = "Completed Challenge";
                } else {
                  actionLabel = "Accepted Challenge";
                }

                // Glow: circle with soft transparent fill + virtue border, icon in virtue color
                // Orchid: solid filled circle, white icon
                const circleStyle = theme.isLight
                  ? { background: color }
                  : { background: `${color}18`, border: `1.5px solid ${color}88` };
                const iconColor = theme.isLight ? "#fff" : color;

                return (
                <div key={act.id} className="flex gap-3">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-0.5"
                    style={circleStyle}
                  >
                    <Icon size={17} style={{ color: iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-sm leading-snug capitalize" style={{ color: theme.text }}>
                        {act.virtue.charAt(0).toUpperCase() + act.virtue.slice(1)}: {actionLabel}
                      </p>
                      <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: theme.mutedText }}>
                        {timeStr}
                      </span>
                    </div>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: theme.subText }}>
                      {act.title ? `${act.title}: ` : ""}{act.text}
                    </p>
                  </div>
                </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <BottomNav active="you" />
    </div>
  );
}