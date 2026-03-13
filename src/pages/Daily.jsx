import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Settings, ChevronLeft, ChevronRight } from "lucide-react";
import confetti from "canvas-confetti";
import BottomNav from "@/components/BottomNav";
import VirtueHexagon, { VIRTUES } from "@/components/VirtueHexagon";
import VirtueCard from "@/components/VirtueCard";
import { format, startOfWeek, addDays, isSameDay, subWeeks, addWeeks } from "date-fns";

const POINTS_PER_VIRTUE = 10;
const BONUS_POINTS = 30;

function getTodayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

export default function Daily() {
  const [user, setUser] = useState(null);
  const [todayProgress, setTodayProgress] = useState(null);
  const [activeVirtue, setActiveVirtue] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const today = new Date();
  const weekStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setUser(u);
      await loadTodayProgress(u.email);
      setLoading(false);
    };
    init();
  }, []);

  const loadTodayProgress = async (email) => {
    const dateStr = getTodayStr();
    const results = await base44.entities.DailyProgress.filter({ user_email: email, date: dateStr });
    if (results.length > 0) {
      setTodayProgress(results[0]);
    } else {
      setTodayProgress({ user_email: email, date: dateStr, completed_virtues: [], points_earned: 0, is_complete: false });
    }
  };

  const handleVirtueClick = (virtueKey) => {
    setActiveVirtue(activeVirtue === virtueKey ? null : virtueKey);
  };

  const handleComplete = async (virtueKey) => {
    if (!user || !todayProgress || saving) return;
    if (todayProgress.completed_virtues?.includes(virtueKey)) return;

    setSaving(true);
    const newCompleted = [...(todayProgress.completed_virtues || []), virtueKey];
    const isNowComplete = newCompleted.length === 6;
    const pointsEarned = newCompleted.length * POINTS_PER_VIRTUE + (isNowComplete ? BONUS_POINTS : 0);

    let updated;
    if (todayProgress.id) {
      updated = await base44.entities.DailyProgress.update(todayProgress.id, {
        completed_virtues: newCompleted,
        points_earned: pointsEarned,
        is_complete: isNowComplete,
      });
    } else {
      updated = await base44.entities.DailyProgress.create({
        user_email: user.email,
        date: getTodayStr(),
        completed_virtues: newCompleted,
        points_earned: pointsEarned,
        is_complete: isNowComplete,
      });
    }
    setTodayProgress(updated);

    // Update user stats
    const statsArr = await base44.entities.UserStats.filter({ user_email: user.email });
    const existingStats = statsArr[0];
    const prevVirtueCount = existingStats?.virtue_counts || {};
    const newVirtueCounts = {
      ...prevVirtueCount,
      [virtueKey]: (prevVirtueCount[virtueKey] || 0) + 1,
    };
    const totalPoints = (existingStats?.total_points || 0) + POINTS_PER_VIRTUE + (isNowComplete ? BONUS_POINTS : 0);
    const level = Math.floor(totalPoints / 200) + 1;

    if (existingStats) {
      await base44.entities.UserStats.update(existingStats.id, {
        total_points: totalPoints,
        level,
        total_completions: isNowComplete ? (existingStats.total_completions || 0) + 1 : existingStats.total_completions,
        virtue_counts: newVirtueCounts,
      });
    } else {
      await base44.entities.UserStats.create({
        user_email: user.email,
        total_points: totalPoints,
        level,
        current_streak: 1,
        longest_streak: 1,
        total_completions: isNowComplete ? 1 : 0,
        virtue_counts: newVirtueCounts,
      });
    }

    setSaving(false);
    if (isNowComplete) {
      setActiveVirtue(null);
      // Celebratory confetti in virtue colors
      const virtueColors = ["#d8b4fe", "#fef08a", "#fda4af", "#86efac", "#ffedd5", "#7dd3fc"];
      const shoot = (origin, angle) =>
        confetti({
          particleCount: 60,
          spread: 70,
          angle,
          origin,
          colors: virtueColors,
          scalar: 1.1,
          gravity: 0.9,
        });
      shoot({ x: 0.1, y: 0.6 }, 60);
      shoot({ x: 0.9, y: 0.6 }, 120);
      setTimeout(() => {
        shoot({ x: 0.3, y: 0.5 }, 80);
        shoot({ x: 0.7, y: 0.5 }, 100);
      }, 300);
      setTimeout(() => shoot({ x: 0.5, y: 0.4 }, 90), 600);
    }
  };

  const completedVirtues = todayProgress?.completed_virtues || [];
  const completedCount = completedVirtues.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#050508", color: "white" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="w-8" />
        <h1
          className="text-xl font-bold tracking-wide"
          style={{ color: "#f3afee", fontFamily: "serif", textShadow: "0 0 20px #f3afee55" }}
        >
          Flourish
        </h1>
        <button className="w-8 h-8 flex items-center justify-center opacity-50 hover:opacity-80 transition-opacity">
          <Settings size={18} />
        </button>
      </div>

      {/* Week calendar */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setWeekOffset(w => w - 1)} className="opacity-40 hover:opacity-80 p-1">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-white/40 tracking-widest uppercase">
            {format(weekStart, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setWeekOffset(w => Math.min(0, w + 1))}
            className="opacity-40 hover:opacity-80 p-1"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div key={i} className="text-center text-xs text-white/25 pb-1">{d}</div>
          ))}
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, today);
            return (
              <div key={i} className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{
                    background: isToday ? "#f3afee" : "transparent",
                    color: isToday ? "white" : "rgba(255,255,255,0.3)",
                    boxShadow: isToday ? "0 0 12px #f3afee66" : "none",
                  }}
                >
                  {format(day, "d")}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hexagon */}
      <div className="flex flex-col items-center flex-1 pt-2">
        <VirtueHexagon
          completedVirtues={completedVirtues}
          onVirtueClick={handleVirtueClick}
          activeVirtue={activeVirtue}
        />

        {/* Progress indicator */}
        <div className="mt-1 text-xs text-white/30 tracking-widest">
          {completedCount}/6
          {todayProgress?.is_complete && (
            <span className="ml-2 text-purple-400">✦ Complete</span>
          )}
        </div>
      </div>

      {/* Bottom card */}
      <div className="px-4 pb-20">
        <div
          className="rounded-2xl p-4 min-h-[90px] flex items-center justify-center transition-all duration-300"
          style={{
            background: "rgba(15,5,25,0.9)",
            border: "1px solid rgba(243,175,238,0.2)",
            boxShadow: "0 0 30px rgba(243,175,238,0.08)",
          }}
        >
          {!activeVirtue ? (
            <p className="text-white/30 text-sm text-center">Tap a virtue to view today's task</p>
          ) : (
            <div className="w-full">
              <VirtueCard
                virtue={activeVirtue}
                isCompleted={completedVirtues.includes(activeVirtue)}
                onComplete={handleComplete}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <BottomNav active="daily" />
    </div>
  );
}