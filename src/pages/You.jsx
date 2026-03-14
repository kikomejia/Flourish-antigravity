import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
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
  { key: "transcendence", label: "Transcendence", color: "#7dd3fc", Icon: Sparkles },
];

function StatCard({ icon, label, children }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "rgba(15,5,25,0.95)",
        border: "1px solid rgba(243,175,238,0.22)",
        boxShadow: "0 0 14px rgba(243,175,238,0.06)",
      }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

export default function You() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen pb-28" style={{ background: "#050508", color: "white" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Settings size={15} className="opacity-50" />
        </button>
        <h1 className="text-lg font-semibold tracking-wide" style={{ color: "#f3afee", fontFamily: "serif", textShadow: "0 0 20px #f3afee55" }}>
          Profile
        </h1>
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Share2 size={15} className="opacity-50" />
        </button>
      </div>

      {/* Avatar + Name */}
      <div className="flex flex-col items-center pt-4 pb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-3"
          style={{
            background: "linear-gradient(135deg, #e879f933, #60efff33)",
            border: "2px solid rgba(243,175,238,0.45)",
            boxShadow: "0 0 28px rgba(243,175,238,0.18)",
          }}
        >
          {user?.full_name?.[0]?.toUpperCase() || "?"}
        </div>
        <h2 className="text-xl font-bold text-white">{user?.full_name || "Seeker"}</h2>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Level {level} • Path of Wisdom
        </p>
      </div>

      <div className="px-4 space-y-4">
        {/* 2x2 Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<Flame size={15} style={{ color: "#ff6b6b" }} />} label="Streak">
            <p className="text-xl font-bold text-white">{stats?.current_streak || 0} <span className="text-base">Days</span></p>
          </StatCard>

          <StatCard icon={<CheckCircle2 size={15} style={{ color: "#86efac" }} />} label="Challenges">
            <p className="text-xl font-bold text-white">{challengesDone} <span className="text-base">Done</span></p>
          </StatCard>

          <StatCard icon={<Shield size={15} style={{ color: "#fda4af" }} />} label="Pledges">
            <p className="text-xl font-bold text-white">{pledgesDone} <span className="text-base">Done</span></p>
          </StatCard>

          <StatCard icon={<Sparkles size={15} style={{ color: "#f3afee" }} />} label="Progress">
            <div className="h-2 rounded-full overflow-hidden mb-1.5" style={{ background: "rgba(255,255,255,0.07)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pointsInLevel}%`, background: "#f3afee", boxShadow: "0 0 8px #f3afee88" }}
              />
            </div>
            <p className="text-xs text-right" style={{ color: "rgba(255,255,255,0.35)" }}>{pointsInLevel} / 100</p>
          </StatCard>
        </div>

        {/* Activity History */}
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white">Activity History</h3>
            <button
              onClick={() => setActiveFilter(null)}
              className="text-sm transition-colors"
              style={{ color: activeFilter ? "#f3afee" : "rgba(255,255,255,0.25)" }}
            >
              See all
            </button>
          </div>

          {/* Virtue filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {VIRTUES.map(v => {
              const isActive = activeFilter === v.key;
              return (
                <button
                  key={v.key}
                  onClick={() => setActiveFilter(isActive ? null : v.key)}
                  className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200"
                  style={{
                    background: isActive ? `${v.color}20` : "rgba(255,255,255,0.05)",
                    border: `1px solid ${isActive ? v.color + "80" : "rgba(255,255,255,0.1)"}`,
                    color: isActive ? v.color : "rgba(255,255,255,0.45)",
                    boxShadow: isActive ? `0 0 12px ${v.color}30` : "none",
                  }}
                >
                  {v.label}
                </button>
              );
            })}
          </div>

          {/* Activity list */}
          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <p className="text-center py-10 text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
                No activities yet
              </p>
            ) : (
              filteredActivities.map(act => {
                const virtue = VIRTUES.find(v => v.key === act.virtue);
                const Icon = virtue?.Icon || Sparkles;
                const color = virtue?.color || "#f3afee";
                const timeStr = act.created_date ? format(new Date(act.created_date), "hh:mm a") : "";
                const typeLabel = act.activity_type === "pledge" ? "Pledge" : "Challenge";

                return (
                  <div key={act.id} className="flex gap-3">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-0.5"
                      style={{ background: `${color}18`, border: `1px solid ${color}44` }}
                    >
                      <Icon size={17} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-sm text-white capitalize leading-snug">
                          {act.virtue}: Completed {typeLabel}
                        </p>
                        <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                          {timeStr}
                        </span>
                      </div>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
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