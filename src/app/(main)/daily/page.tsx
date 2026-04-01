"use client";

import React, { useState, useEffect } from "react";
import VirtueHexagon, { VIRTUES } from "@/components/VirtueHexagon";
import VirtueCard from "@/components/VirtueCard";
import BottomNav from "@/components/BottomNav";
import { useTheme } from "@/lib/ThemeContext";
import { useAuth } from "@/lib/AuthContext";
import { Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { DailyProgressService, ActivityLogService, UserStatsService } from "@/lib/services/db";

function fireConfetti() {
  const virtueColors = ["#d8b4fe", "#fef08a", "#fda4af", "#86efac", "#ffedd5", "#7dd3fc"];
  const shoot = (origin: any, angle: any) =>
    confetti({ particleCount: 60, spread: 70, angle, origin, colors: virtueColors, scalar: 1.1, gravity: 0.9 });
  shoot({ x: 0.1, y: 0.6 }, 60);
  shoot({ x: 0.9, y: 0.6 }, 120);
  setTimeout(() => { shoot({ x: 0.3, y: 0.5 }, 80); shoot({ x: 0.7, y: 0.5 }, 100); }, 300);
  setTimeout(() => shoot({ x: 0.5, y: 0.4 }, 90), 600);
}

export default function DailyPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [completedVirtues, setCompletedVirtues] = useState<string[]>([]);
  const [activeVirtue, setActiveVirtue] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  useEffect(() => {
    setActiveVirtue(null); // Reset active petal on day change
    if (user?.email) {
      DailyProgressService.getByDate(user.email, format(selectedDate, "yyyy-MM-dd"))
        .then(res => setCompletedVirtues(res.completed_virtues || []));
    }
  }, [user, selectedDate]);

  const isViewingToday = isSameDay(selectedDate, new Date());

  const handleVirtueClick = (virtueKey: string) => {
    if (!isViewingToday) return; // Lock interactions on past/future days
    setActiveVirtue(activeVirtue === virtueKey ? null : virtueKey);
  };

  const handleComplete = async (virtueKey: string) => {
    if (!isViewingToday) return;
    if (!completedVirtues.includes(virtueKey)) {
      const newCompleted = [...completedVirtues, virtueKey];
      setCompletedVirtues(newCompleted);
      
      if (newCompleted.length === 6) {
        fireConfetti();
        setActiveVirtue(null);
      } else {
        setActiveVirtue(null);
      }

      // Save to mock DB
      if (user?.email) {
        // Update daily progress
        await DailyProgressService.update("mock-id", {
          user_email: user.email,
          date: format(selectedDate, "yyyy-MM-dd"),
          completed_virtues: newCompleted,
          points_earned: newCompleted.length * 10
        });

        // Add Activity Log
        await ActivityLogService.create({
          user_email: user.email,
          virtue: virtueKey,
          activity_type: "pledge",
          title: `Daily pledge for ${virtueKey}`,
          text: `Completed the daily virtue pledge.`
        });
        
        // Update User Stats (points)
        const stats = await UserStatsService.getByEmail(user.email);
        await UserStatsService.update("mock-id", {
          user_email: user.email,
          total_points: (stats?.total_points || 0) + 10,
          current_streak: stats?.current_streak || 1
        });
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: theme.bg, color: theme.text }}>
      <div className="flex items-center justify-between px-4 py-4 pt-12">
        <div className="w-8" />
        <h1 className="text-xl font-bold tracking-wide" style={{ color: theme.accent, fontFamily: "var(--font-recoleta)", textShadow: theme.headerGlow ? `0 0 20px ${theme.accent}55` : "none" }}>
          Flourish
        </h1>
        <button className="w-8 h-8 flex items-center justify-center opacity-50">
          <Settings size={18} />
        </button>
      </div>

      {/* Week Calendar */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between px-6 mb-3">
          <button onClick={() => setCurrentWeek(addDays(currentWeek, -7))} className="p-1 border-0 bg-transparent text-slate-400 cursor-pointer transition-opacity hover:opacity-100 opacity-70">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: theme.subText }}>
            {format(currentWeek, "MMMM yyyy")}
          </span>
          <button 
            onClick={() => {
              const todayWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
              if (currentWeek < todayWeekStart) setCurrentWeek(addDays(currentWeek, 7));
            }} 
            className="p-1 border-0 bg-transparent transition-opacity cursor-pointer"
            style={{ 
              color: currentWeek < startOfWeek(new Date(), { weekStartsOn: 1 }) ? "#94a3b8" : "transparent",
              pointerEvents: currentWeek < startOfWeek(new Date(), { weekStartsOn: 1 }) ? "auto" : "none"
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div key={i} className="flex items-center justify-center text-xs pb-1" style={{ color: theme.subText }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, i) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const isFuture = day > new Date() && !isToday;

            return (
              <div 
                key={i} 
                className={`flex flex-col items-center ${isFuture ? "cursor-default opacity-30" : "cursor-pointer transition-opacity hover:opacity-80"}`} 
                onClick={() => {
                  if (!isFuture) setSelectedDate(day);
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all"
                  style={{
                    background: isSelected ? theme.accent : "transparent",
                    color: isSelected ? (theme.isLight ? "#fff" : "#1a0a1a") : theme.subText,
                    border: isToday && !isSelected ? `1.5px solid ${theme.accent}66` : "none",
                    fontWeight: isToday || isSelected ? "bold" : "500"
                  }}
                >
                  {format(day, "d")}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hexagon Subtitles */}
      <div className="text-center px-6 h-16 flex items-center justify-center mt-2">
        <AnimatePresence mode="wait">
          {(!isViewingToday) ? (
            <motion.div key="past-prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-base font-semibold" style={{ color: theme.accent, fontFamily: "var(--font-recoleta)" }}>
                {format(selectedDate, "MMM d, yyyy")}
              </p>
            </motion.div>
          ) : completedVirtues.length === 6 ? (
            <motion.div key="complete-prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-base font-semibold" style={{ color: theme.accent, fontFamily: "var(--font-recoleta)" }}>
                All pledges completed!
              </p>
            </motion.div>
          ) : activeVirtue ? (
            <motion.div
              key={activeVirtue}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <p className="text-xl font-bold" style={{ color: theme.virtueColors[activeVirtue] }}>
                {activeVirtue.charAt(0).toUpperCase() + activeVirtue.slice(1)}
              </p>
            </motion.div>
          ) : (
            <motion.div key="prompt" className="text-base font-semibold" style={{ color: theme.accent, fontFamily: "var(--font-recoleta)" }}>
              Tap on a petal to start
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interactive Flower */}
      <div className="flex flex-col items-center justify-center -mt-4 mb-2 z-10">
        <VirtueHexagon
          completedVirtues={completedVirtues}
          acceptedVirtues={[]}
          onVirtueClick={handleVirtueClick}
          activeVirtue={activeVirtue}
        />
      </div>

      {/* Card area */}
      <div className="px-4 mt-2 mb-20 flex-1">
        <AnimatePresence mode="wait">
          {!isViewingToday ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="mt-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-px" style={{ background: `${theme.accent}25` }} />
                <span className="text-xs tracking-widest uppercase font-semibold" style={{ color: theme.accent }}>Past Achievements</span>
                <div className="flex-1 h-px" style={{ background: `${theme.accent}25` }} />
              </div>
              
              <div className="space-y-4">
                {completedVirtues.length > 0 ? (
                  VIRTUES.filter(v => completedVirtues.includes(v.key)).map(v => (
                    <VirtueCard key={v.key} virtue={v.key} isCompleted={true} onComplete={() => {}} />
                  ))
                ) : (
                  <p className="text-center text-sm" style={{ color: theme.mutedText }}>No virtues were completed on this date.</p>
                )}
              </div>
            </motion.div>
          ) : completedVirtues.length === 6 ? (
            <motion.div
              key="today"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="mt-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-px" style={{ background: `${theme.accent}25` }} />
                <span className="text-xs tracking-widest uppercase font-semibold" style={{ color: theme.accent }}>Today's Achievements</span>
                <div className="flex-1 h-px" style={{ background: `${theme.accent}25` }} />
              </div>
              
              <div className="space-y-4">
                {VIRTUES.map(v => (
                  <VirtueCard key={v.key} virtue={v.key} isCompleted={true} onComplete={() => {}} />
                ))}
              </div>
            </motion.div>
          ) : activeVirtue ? (
            <motion.div
              key={activeVirtue}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <VirtueCard
                virtue={activeVirtue}
                isCompleted={completedVirtues.includes(activeVirtue)}
                onComplete={handleComplete}
              />
            </motion.div>
          ) : (
            <motion.div 
              key="quote"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center mt-10"
            >
              <p className="italic text-sm mx-auto max-w-[280px] leading-relaxed" style={{ color: theme.subText }}>
                "The good life is one inspired by love and guided by knowledge."
              </p>
              <p className="uppercase text-xs font-semibold tracking-widest mt-4" style={{ color: theme.mutedText }}>
                BERTRAND RUSSELL
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <BottomNav active="daily" />
    </div>
  );
}
