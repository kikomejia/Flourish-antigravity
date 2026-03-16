import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import BottomNav from "@/components/BottomNav";
import VirtueHexagon, { VIRTUES } from "@/components/VirtueHexagon";
import VirtueCard, { VIRTUE_COLORS, VIRTUE_CULTIVATE, VIRTUE_DEFINITIONS, getDailyItem } from "@/components/VirtueCard";
import { format, startOfWeek, addDays, isSameDay, addWeeks, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const POINTS_PER_VIRTUE = 1;
const BONUS_POINTS = 4;

function getTodayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

function fireConfetti() {
  const virtueColors = ["#d8b4fe", "#fef08a", "#fda4af", "#86efac", "#ffedd5", "#7dd3fc"];
  const shoot = (origin, angle) =>
    confetti({ particleCount: 60, spread: 70, angle, origin, colors: virtueColors, scalar: 1.1, gravity: 0.9 });
  shoot({ x: 0.1, y: 0.6 }, 60);
  shoot({ x: 0.9, y: 0.6 }, 120);
  setTimeout(() => { shoot({ x: 0.3, y: 0.5 }, 80); shoot({ x: 0.7, y: 0.5 }, 100); }, 300);
  setTimeout(() => shoot({ x: 0.5, y: 0.4 }, 90), 600);
}

export default function Daily() {
  const [user, setUser] = useState(null);
  const [todayProgress, setTodayProgress] = useState({ completed_virtues: [], points_earned: 0, is_complete: false });
  const [activeVirtue, setActiveVirtue] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [slideDir, setSlideDir] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [historicalProgress, setHistoricalProgress] = useState(null);
  const [historicalActivities, setHistoricalActivities] = useState([]);
  const [historicalLoading, setHistoricalLoading] = useState(false);

  const [virtueStates, setVirtueStates] = useState(() => {
    try {
      const stored = localStorage.getItem("virtueStates");
      if (stored) {
        const { date, states } = JSON.parse(stored);
        if (date === getTodayStr()) return states;
      }
    } catch {}
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem("virtueStates", JSON.stringify({ date: getTodayStr(), states: virtueStates }));
    } catch {}
  }, [virtueStates]);

  const today = new Date();
  const todayStr = getTodayStr();
  const weekStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    const init = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        if (u?.email) {
          await loadTodayProgress(u.email);
        } else {
          // Restore guest progress from localStorage
          const saved = localStorage.getItem("guest_progress_" + getTodayStr());
          if (saved) setTodayProgress(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        // Still try to restore guest progress on error
        const saved = localStorage.getItem("guest_progress_" + getTodayStr());
        if (saved) setTodayProgress(JSON.parse(saved));
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadTodayProgress = async (email) => {
    const results = await base44.entities.DailyProgress.filter({ user_email: email, date: todayStr });
    if (results.length > 0) {
      setTodayProgress(results[0]);
    } else {
      setTodayProgress({ user_email: email, date: todayStr, completed_virtues: [], points_earned: 0, is_complete: false });
    }
  };

  const changeWeek = (dir) => {
    if (dir === 1 && weekOffset >= 0) return;
    setSlideDir(dir);
    setWeekOffset(w => w + dir);
  };

  const handleDayClick = async (day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    if (dateStr > todayStr) return; // future

    setSelectedDate(dateStr);
    setActiveVirtue(null);

    if (dateStr === todayStr) {
      setHistoricalProgress(null);
      setHistoricalActivities([]);
      return;
    }

    setHistoricalLoading(true);
    const [progressArr, acts] = await Promise.all([
      base44.entities.DailyProgress.filter({ user_email: user.email, date: dateStr }),
      base44.entities.ActivityLog.filter({ user_email: user.email }, "-created_date", 500),
    ]);

    const prog = progressArr[0] || { completed_virtues: [], is_complete: false };
    const dayActs = acts.filter(a => {
      if (!a.created_date) return false;
      return format(new Date(a.created_date), "yyyy-MM-dd") === dateStr;
    });

    setHistoricalProgress(prog);
    setHistoricalActivities(dayActs);
    setHistoricalLoading(false);

    if (prog.is_complete) {
      setTimeout(fireConfetti, 300);
    }
  };

  const handleVirtueClick = (virtueKey) => {
    if (selectedDate !== todayStr) return;
    setActiveVirtue(activeVirtue === virtueKey ? null : virtueKey);
  };

  const handleComplete = async (virtueKey) => {
    if (saving) return;
    if (todayProgress.completed_virtues?.includes(virtueKey)) return;

    const newCompleted = [...(todayProgress.completed_virtues || []), virtueKey];
    const isNowComplete = newCompleted.length === 6;
    const pointsEarned = newCompleted.length * POINTS_PER_VIRTUE + (isNowComplete ? BONUS_POINTS : 0);
    const updated = { ...todayProgress, completed_virtues: newCompleted, points_earned: pointsEarned, is_complete: isNowComplete };

    // Optimistically update UI immediately (works with or without a user)
    setTodayProgress(updated);
    if (isNowComplete) {
      setActiveVirtue(null);
      fireConfetti();
    }

    // Persist to localStorage for guest users
    if (!user) {
      try {
        // Save today's progress so it survives navigation
        localStorage.setItem("guest_progress_" + todayStr, JSON.stringify(updated));

        const prevStats = JSON.parse(localStorage.getItem("guest_stats") || "{}");
        const prevCounts = prevStats.virtue_counts || {};
        const totalPoints = (prevStats.total_points || 0) + POINTS_PER_VIRTUE + (isNowComplete ? BONUS_POINTS : 0);
        const newStats = {
          total_points: totalPoints,
          level: Math.floor(totalPoints / 100) + 1,
          total_completions: (prevStats.total_completions || 0) + (isNowComplete ? 1 : 0),
          virtue_counts: { ...prevCounts, [virtueKey]: (prevCounts[virtueKey] || 0) + 1 },
          current_streak: prevStats.current_streak || 1,
        };
        localStorage.setItem("guest_stats", JSON.stringify(newStats));

        const changeCount = virtueStates[virtueKey]?.changeCount ?? 0;
        const item = getDailyItem(virtueKey, changeCount);
        const prevActs = JSON.parse(localStorage.getItem("guest_activities") || "[]");
        prevActs.unshift({ id: Date.now(), virtue: virtueKey, activity_type: item?.type || "challenge", action: "completed", title: item?.title || "", text: item?.text || "", created_date: new Date().toISOString() });
        localStorage.setItem("guest_activities", JSON.stringify(prevActs.slice(0, 200)));
      } catch {}
      return;
    }

    setSaving(true);
    try {
      let saved;
      if (todayProgress.id) {
        saved = await base44.entities.DailyProgress.update(todayProgress.id, {
          completed_virtues: newCompleted, points_earned: pointsEarned, is_complete: isNowComplete,
        });
      } else {
        saved = await base44.entities.DailyProgress.create({
          user_email: user.email, date: todayStr,
          completed_virtues: newCompleted, points_earned: pointsEarned, is_complete: isNowComplete,
        });
      }
      setTodayProgress(saved);

      const statsArr = await base44.entities.UserStats.filter({ user_email: user.email });
      const existingStats = statsArr[0];
      const prevVirtueCount = existingStats?.virtue_counts || {};
      const newVirtueCounts = { ...prevVirtueCount, [virtueKey]: (prevVirtueCount[virtueKey] || 0) + 1 };
      const totalPoints = (existingStats?.total_points || 0) + POINTS_PER_VIRTUE + (isNowComplete ? BONUS_POINTS : 0);
      const level = Math.floor(totalPoints / 100) + 1;

      if (existingStats) {
        await base44.entities.UserStats.update(existingStats.id, {
          total_points: totalPoints, level,
          total_completions: isNowComplete ? (existingStats.total_completions || 0) + 1 : existingStats.total_completions,
          virtue_counts: newVirtueCounts,
        });
      } else {
        await base44.entities.UserStats.create({
          user_email: user.email, total_points: totalPoints, level,
          current_streak: 1, longest_streak: 1,
          total_completions: isNowComplete ? 1 : 0, virtue_counts: newVirtueCounts,
        });
      }

      const changeCount = virtueStates[virtueKey]?.changeCount ?? 0;
      const item = getDailyItem(virtueKey, changeCount);
      await base44.entities.ActivityLog.create({
        user_email: user.email, virtue: virtueKey,
        activity_type: item?.type || "challenge", action: "completed",
        title: item?.title || "", text: item?.text || "",
      });
    } finally {
      setSaving(false);
    }
  };

  const isViewingToday = selectedDate === todayStr;
  const viewProgress = isViewingToday ? todayProgress : historicalProgress;
  const completedVirtues = viewProgress?.completed_virtues || [];
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
        <h1 className="text-xl font-bold tracking-wide" style={{ color: "#f3afee", fontFamily: "serif", textShadow: "0 0 20px #f3afee55" }}>
          Flourish
        </h1>
        <button onClick={() => navigate("/Settings")} className="w-8 h-8 flex items-center justify-center opacity-50 hover:opacity-80 transition-opacity">
          <Settings size={18} />
        </button>
      </div>

      {/* Week calendar */}
      <div className="px-4 pb-3">
        {/* Month label with arrows */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => changeWeek(-1)}
            className="w-8 h-8 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.55)" }}>
            {format(weekStart, "MMMM yyyy")}
          </span>
          <button
            onClick={() => changeWeek(1)}
            disabled={weekOffset >= 0}
            className="w-8 h-8 flex items-center justify-center opacity-70 hover:opacity-100 disabled:opacity-20 transition-opacity"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div>
          {/* Day labels row */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="flex items-center justify-center text-xs pb-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                <span>{d}</span>
              </div>
            ))}
          </div>

          {/* Animated week grid */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={weekOffset}
                initial={{ x: slideDir * 50, opacity: 0, filter: "blur(4px)" }}
                animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ x: -slideDir * 50, opacity: 0, filter: "blur(4px)" }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
                className="grid grid-cols-7 gap-1"
              >
                {weekDays.map((day, i) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const isToday = isSameDay(day, today);
                  const isFuture = dateStr > todayStr;
                  const isSelected = selectedDate === dateStr;

                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        onClick={() => !isFuture && handleDayClick(day)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200"
                        style={{
                          background: isSelected ? "#f3afee" : "transparent",
                          color: isFuture
                            ? "rgba(255,255,255,0.15)"
                            : isSelected
                            ? "#1a0a1a"
                            : isToday
                            ? "#f3afee"
                            : "rgba(255,255,255,0.55)",
                          boxShadow: isSelected ? "0 0 12px #f3afee66" : "none",
                          cursor: isFuture ? "default" : "pointer",
                          border: isToday && !isSelected ? "1px solid rgba(243,175,238,0.35)" : "none",
                        }}
                      >
                        {format(day, "d")}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Historical date label */}
      {!isViewingToday && (
        <div className="text-center pb-1">
          <span className="text-xs tracking-widest" style={{ color: "rgba(243,175,238,0.6)" }}>
            {format(parseISO(selectedDate), "MMMM d, yyyy")}
          </span>
        </div>
      )}

      {/* Active virtue title + definition — always reserves space so hexagon never shifts */}
      {isViewingToday && (
        <div className="text-center px-6 pb-0" style={{ height: "72px", overflow: "hidden" }}>
          <AnimatePresence mode="wait">
            {activeVirtue ? (
              <motion.div
                key={activeVirtue}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <p className="text-xl font-bold mb-1" style={{ color: VIRTUE_COLORS[activeVirtue] }}>
                  {activeVirtue.charAt(0).toUpperCase() + activeVirtue.slice(1)}
                </p>
                {VIRTUE_DEFINITIONS[activeVirtue] && (
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {VIRTUE_DEFINITIONS[activeVirtue]}
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="prompt"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="flex items-center justify-center"
                style={{ height: "60px" }}
              >
                <span
                  className="text-base font-bold tracking-widest"
                  style={{ color: "#f3afee", fontFamily: "monospace", textShadow: "0 0 20px #f3afee55" }}
                >
                  TAP ON A PETAL TO START
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Hexagon */}
      <div className="flex flex-col items-center justify-center" style={{ marginTop: "-14px", marginBottom: "-8px" }}>
        <VirtueHexagon
          completedVirtues={completedVirtues}
          acceptedVirtues={isViewingToday ? Object.entries(virtueStates).filter(([, s]) => s?.accepted).map(([k]) => k) : []}
          onVirtueClick={handleVirtueClick}
          activeVirtue={isViewingToday ? activeVirtue : null}
          showPrompt={false}
        />
        {/* Cultivate text — always reserves space so hexagon never shifts */}
        {isViewingToday && (
          <div style={{ height: "52px", overflow: "hidden" }} className="flex items-center justify-center">
            <AnimatePresence mode="wait">
              {activeVirtue && VIRTUE_CULTIVATE[activeVirtue] && (
                <motion.p
                  key={activeVirtue}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="mt-0 mb-3 text-sm text-center px-6 leading-relaxed"
                  style={{ color: VIRTUE_COLORS[activeVirtue] }}
                >
                  {VIRTUE_CULTIVATE[activeVirtue]}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Historical view */}
      {!isViewingToday && !historicalLoading && (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDate}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="px-4 pb-24 mt-2"
          >
            {completedVirtues.length === 0 ? (
              <div className="text-center py-8 text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
                No virtues completed on this day
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 h-px" style={{ background: "rgba(243,175,238,0.25)" }} />
                  <span className="text-xs tracking-widest uppercase font-semibold" style={{ color: "#f3afee" }}>Achievements</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(243,175,238,0.25)" }} />
                </div>
                <div className="space-y-3">
                  {VIRTUES.filter(v => completedVirtues.includes(v.key)).map(v => {
                    const act = historicalActivities.find(a => a.virtue === v.key);
                    return (
                      <div
                        key={v.key}
                        className="rounded-xl p-3 flex items-start gap-3"
                        style={{
                          background: `${v.color}0d`,
                          border: `1px solid ${v.color}44`,
                          boxShadow: `0 0 12px ${v.color}18`,
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ background: v.color, boxShadow: `0 0 6px ${v.color}` }}
                        />
                        <div>
                          <p className="text-xs font-bold tracking-widest uppercase mb-0.5" style={{ color: v.color }}>{v.label}</p>
                          {act ? (
                            <>
                              <p className="text-sm font-semibold text-white/90">{act.title}</p>
                              <p className="text-xs text-white/50 mt-0.5">{act.text}</p>
                            </>
                          ) : (
                            <p className="text-sm text-white/50">Completed</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Today's interface */}
      {isViewingToday && (
        <>
          {!todayProgress?.is_complete && activeVirtue && (
            <div className="px-4 mt-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeVirtue}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="rounded-2xl p-4"
                  style={{
                    background: "rgba(15,5,25,0.97)",
                    border: `1px solid ${VIRTUE_COLORS[activeVirtue]}99`,
                    boxShadow: `0 0 28px ${VIRTUE_COLORS[activeVirtue]}55, inset 0 0 20px ${VIRTUE_COLORS[activeVirtue]}08`,
                  }}
                >
                  <VirtueCard
                    virtue={activeVirtue}
                    isCompleted={completedVirtues.includes(activeVirtue)}
                    onComplete={handleComplete}
                    changeCount={virtueStates[activeVirtue]?.changeCount ?? 0}
                    onChange={() => setVirtueStates(s => ({ ...s, [activeVirtue]: { ...s[activeVirtue], changeCount: (s[activeVirtue]?.changeCount ?? 0) + 1 } }))}
                  />
                </motion.div>
              </AnimatePresence>
              <div className="mt-3 mb-24 text-center text-xs text-white/30 tracking-widest">
                {completedCount}/6
                {viewProgress?.is_complete && <span className="ml-2 text-purple-400">✦ Complete</span>}
              </div>
            </div>
          )}
          {!todayProgress?.is_complete && !activeVirtue && (
            <div className="mt-3 mb-4 text-center text-xs text-white/30 tracking-widest">
              {completedCount}/6
              {viewProgress?.is_complete && <span className="ml-2 text-purple-400">✦ Complete</span>}
            </div>
          )}

          {todayProgress?.is_complete && (
            <div className="px-4 pb-24">
              <div className="flex items-center gap-2 mb-4 mt-8">
                <div className="flex-1 h-px" style={{ background: "rgba(243,175,238,0.25)" }} />
                <span className="text-xs tracking-widest uppercase font-semibold" style={{ color: "#f3afee" }}>Today's Achievements</span>
                <div className="flex-1 h-px" style={{ background: "rgba(243,175,238,0.25)" }} />
              </div>
              <div className="space-y-3">
                {VIRTUES.map(v => (
                  <div
                    key={v.key}
                    className="rounded-xl p-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${v.color}33, ${v.color}11)`,
                      border: `1px solid ${v.color}55`,
                      boxShadow: `0 0 16px ${v.color}22`,
                    }}
                  >
                    <VirtueCard virtue={v.key} isCompleted={true} onComplete={() => {}} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <BottomNav active="daily" />
    </div>
  );
}