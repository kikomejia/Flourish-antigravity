"use client";

import React, { useState, useEffect } from "react";
import { useTheme, getPillStyle } from "@/lib/ThemeContext";
import { format } from "date-fns";
import { Flame, CheckCircle2, Shield, Sparkles, Lightbulb, Heart, Scale, Leaf, Settings, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { VIRTUE_COLORS } from "@/components/VirtueCard";
import { UserStatsService, ActivityLogService } from "@/lib/services/db";
import { useAuth } from "@/lib/AuthContext";

const VIRTUES = [
  { key: "wisdom", label: "Wisdom", color: "#d8b4fe", Icon: Lightbulb },
  { key: "courage", label: "Courage", color: "#fef08a", Icon: Shield },
  { key: "humanity", label: "Humanity", color: "#fda4af", Icon: Heart },
  { key: "justice", label: "Justice", color: "#86efac", Icon: Scale },
  { key: "temperance", label: "Temperance", color: "#ffedd5", Icon: Leaf },
  { key: "transcendence", label: "Transcendence", color: "#38bdf8", Icon: Sparkles },
];

function StatCard({ icon, label, children, theme }: any) {
  const cardStyle = theme.cardGlow
    ? { background: theme.cardBg, border: `1px solid ${theme.accent}55`, boxShadow: `0 0 16px ${theme.accent}22` }
    : { background: "#ffffff", border: "none" };
  return (
    <div className="rounded-2xl p-4" style={cardStyle}>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-xs font-medium" style={{ color: theme.subText }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

export default function YouPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  
  const [profileData, setProfileData] = useState({ nickname: "", photo: "" });

  useEffect(() => {
    // Only access localStorage on client after mount
    setProfileData({
      nickname: localStorage.getItem("profile_nickname") || "",
      photo: localStorage.getItem("profile_photo") || ""
    });

    const init = async () => {
      try {
        if (user?.email) {
          const statsArr = await UserStatsService.getByEmail(user.email);
          const acts = await ActivityLogService.getByEmail(user.email, 100);
          setStats(statsArr || { total_points: 0, current_streak: 0 });
          setActivities(acts || []);
        } else {
          const guestStats = JSON.parse(localStorage.getItem("guest_stats") || "{}");
          const guestActs = JSON.parse(localStorage.getItem("guest_activities") || "[]");
          setStats({ total_points: 0, current_streak: 0, ...guestStats });
          setActivities(guestActs);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        const guestStats = JSON.parse(localStorage.getItem("guest_stats") || "{}");
        const guestActs = JSON.parse(localStorage.getItem("guest_activities") || "[]");
        setStats({ total_points: 0, current_streak: 0, ...guestStats });
        setActivities(guestActs);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user]);

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
      <div className="flex items-center justify-between px-4 pb-2 pt-16">
        <button
          onClick={() => router.push("/settings")}
          className="w-9 h-9 border-0 rounded-full flex items-center justify-center"
          style={{ background: theme.inputBg }}
        >
          <Settings size={15} className="opacity-50" />
        </button>
        <h1 className="text-xl font-bold tracking-wide" style={{ color: theme.accent, fontFamily: "var(--font-recoleta)", textShadow: theme.headerGlow ? `0 0 20px ${theme.accent}55` : "none" }}>
          Profile
        </h1>
        <button
          className="w-9 h-9 rounded-full border-0 flex items-center justify-center"
          style={{ background: theme.inputBg }}
        >
          <Share2 size={15} className="opacity-50" />
        </button>
      </div>

      <div className="flex flex-col items-center pt-4 pb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-3 overflow-hidden"
          style={{
            background: profileData.photo ? "transparent" : theme.inputBg,
            border: `2px solid ${theme.accent}${theme.isLight ? "55" : "99"}`,
            boxShadow: theme.isLight ? "none" : `0 0 20px ${theme.accent}44`,
          }}
        >
          {profileData.photo
            ? <img src={profileData.photo} alt="profile" className="w-full h-full object-cover" />
            : (profileData.nickname?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?")}
        </div>
        <h2 className="text-xl font-bold" style={{ color: theme.text }}>{profileData.nickname || user?.email?.split('@')[0] || "Seeker"}</h2>
        <p className="text-sm mt-1" style={{ color: theme.subText }}>
          Level {level} &middot; Path of Wisdom
        </p>
      </div>

      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard theme={theme} icon={<Flame size={15} style={{ color: theme.isLight ? "#c0356a" : "#ff6b6b" }} />} label="Streak">
            <p className="text-xl font-bold" style={{ color: theme.text }}>{stats?.current_streak || 0} <span className="text-base font-normal">Days</span></p>
          </StatCard>

          <StatCard theme={theme} icon={<CheckCircle2 size={15} style={{ color: theme.virtueColors.justice }} />} label="Challenges">
            <p className="text-xl font-bold" style={{ color: theme.text }}>{challengesDone} <span className="text-base font-normal">Done</span></p>
          </StatCard>

          <StatCard theme={theme} icon={<Shield size={15} style={{ color: theme.virtueColors.humanity }} />} label="Pledges">
            <p className="text-xl font-bold" style={{ color: theme.text }}>{pledgesDone} <span className="text-base font-normal">Done</span></p>
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

        <div>
          <div className="flex items-center justify-between mb-3 mt-6">
            <h3 className="text-base font-bold" style={{ color: theme.text }}>Activity History</h3>
            <button
              onClick={() => setActiveFilter(null)}
              className="text-sm border-0 bg-transparent transition-colors p-0"
              style={{ color: activeFilter ? theme.accent : theme.mutedText }}
            >
              See all
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: "none" }}>
            {VIRTUES.map(v => {
              const isActive = activeFilter === v.key;
              const vColor = theme.virtueColors[v.key] || v.color;
              return (
                <button
                  key={v.key}
                  onClick={() => setActiveFilter(isActive ? null : v.key)}
                  className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200"
                  style={isActive
                    ? { ...getPillStyle(theme, vColor), border: "none" }
                    : { background: "transparent", color: theme.subText, border: `1px solid ${theme.pillFilled ? `${vColor}40` : "rgba(255,255,255,0.15)"}` }
                  }
                >
                  {v.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <p className="text-center py-10 text-sm" style={{ color: theme.mutedText }}>
                No activities yet
              </p>
            ) : (
              filteredActivities.map((act: any) => {
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
