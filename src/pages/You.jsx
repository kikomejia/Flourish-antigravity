import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, subDays } from "date-fns";
import { Flame, Star, Trophy, Zap } from "lucide-react";
import { BottomNav } from "./Daily";
import { VIRTUE_COLORS } from "@/components/VirtueCard";

const LEVELS = [
  { level: 1, title: "Seeker", min: 0 },
  { level: 2, title: "Apprentice", min: 200 },
  { level: 3, title: "Practitioner", min: 500 },
  { level: 4, title: "Adept", min: 1000 },
  { level: 5, title: "Sage", min: 2000 },
  { level: 6, title: "Philosopher", min: 3500 },
  { level: 7, title: "Luminary", min: 5500 },
  { level: 8, title: "Enlightened", min: 8000 },
];

function getLevelInfo(points) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].min) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
    }
  }
  const progress = next
    ? ((points - current.min) / (next.min - current.min)) * 100
    : 100;
  return { current, next, progress };
}

const VIRTUE_NAMES = ["wisdom", "courage", "humanity", "justice", "temperance", "transcendence"];

export default function You() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentDays, setRecentDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setUser(u);

      const statsArr = await base44.entities.UserStats.filter({ user_email: u.email });
      const s = statsArr[0] || { total_points: 0, level: 1, current_streak: 0, longest_streak: 0, total_completions: 0, virtue_counts: {} };
      setStats(s);

      // Load last 14 days
      const days = [];
      for (let i = 13; i >= 0; i--) {
        const d = format(subDays(new Date(), i), "yyyy-MM-dd");
        days.push(d);
      }
      const progressRecords = await base44.entities.DailyProgress.filter({ user_email: u.email });
      const byDate = {};
      progressRecords.forEach(r => { byDate[r.date] = r; });
      setRecentDays(days.map(d => ({ date: d, record: byDate[d] || null })));

      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  const totalPoints = stats?.total_points || 0;
  const { current, next, progress } = getLevelInfo(totalPoints);
  const virtueCountsData = stats?.virtue_counts || {};
  const maxVirtueCount = Math.max(...VIRTUE_NAMES.map(v => virtueCountsData[v] || 0), 1);

  return (
    <div className="min-h-screen pb-28" style={{ background: "#050508", color: "white" }}>
      {/* Header */}
      <div className="flex items-center justify-center px-4 pt-4 pb-4">
        <h1
          className="text-xl font-bold tracking-wide"
          style={{ color: "#e879f9", fontFamily: "serif", textShadow: "0 0 20px #e879f955" }}
        >
          Flourish
        </h1>
      </div>

      <div className="px-4 space-y-4">
        {/* Profile card */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "rgba(15,5,25,0.9)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
              style={{ background: "linear-gradient(135deg, #e879f933, #60efff33)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {user?.full_name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="font-semibold text-white">{user?.full_name || "Seeker"}</p>
              <p className="text-xs text-white/40">{user?.email}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star size={12} style={{ color: "#e879f9" }} />
                <span className="text-xs" style={{ color: "#e879f9" }}>{current.title}</span>
                <span className="text-xs text-white/25 ml-1">Level {current.level}</span>
              </div>
            </div>
          </div>

          {/* XP bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/40 mb-1.5">
              <span>{totalPoints} pts</span>
              {next && <span>{next.min} pts for {next.title}</span>}
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  background: "linear-gradient(90deg, #e879f9, #60efff)",
                  boxShadow: "0 0 8px #e879f966",
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Flame size={18} style={{ color: "#ff6b6b" }} />, label: "Streak", value: stats?.current_streak || 0, unit: "days" },
            { icon: <Trophy size={18} style={{ color: "#ffd700" }} />, label: "Complete", value: stats?.total_completions || 0, unit: "days" },
            { icon: <Zap size={18} style={{ color: "#60efff" }} />, label: "Best", value: stats?.longest_streak || 0, unit: "days" },
          ].map(({ icon, label, value, unit }) => (
            <div
              key={label}
              className="rounded-xl p-3 text-center"
              style={{ background: "rgba(15,5,25,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex justify-center mb-1">{icon}</div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-white/35 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Activity heatmap */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "rgba(15,5,25,0.9)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3 font-semibold">Last 14 Days</h3>
          <div className="grid grid-cols-7 gap-1.5">
            {recentDays.map(({ date, record }) => {
              const count = record?.completed_virtues?.length || 0;
              const isFull = count === 6;
              const opacity = count === 0 ? 0.08 : count / 6;
              return (
                <div
                  key={date}
                  className="aspect-square rounded-md flex items-center justify-center text-xs"
                  style={{
                    background: count === 0
                      ? "rgba(255,255,255,0.05)"
                      : `rgba(232,121,249,${opacity})`,
                    border: isFull ? "1px solid rgba(232,121,249,0.5)" : "1px solid transparent",
                    boxShadow: isFull ? "0 0 6px rgba(232,121,249,0.3)" : "none",
                  }}
                  title={`${date}: ${count}/6 virtues`}
                >
                  {isFull && <span style={{ color: "#e879f9", fontSize: "8px" }}>✦</span>}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-2 mt-2">
            <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(255,255,255,0.05)" }} />
            <span className="text-xs text-white/25">0</span>
            <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(232,121,249,0.5)" }} />
            <span className="text-xs text-white/25">6/6</span>
          </div>
        </div>

        {/* Virtue breakdown */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "rgba(15,5,25,0.9)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3 font-semibold">Virtue Practice</h3>
          <div className="space-y-2.5">
            {VIRTUE_NAMES.map(v => {
              const count = virtueCountsData[v] || 0;
              const pct = (count / maxVirtueCount) * 100;
              const color = VIRTUE_COLORS[v];
              return (
                <div key={v} className="flex items-center gap-3">
                  <span className="text-xs w-24 capitalize font-mono" style={{ color, opacity: 0.8 }}>{v}</span>
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}66` }}
                    />
                  </div>
                  <span className="text-xs text-white/30 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNav active="you" />
    </div>
  );
}