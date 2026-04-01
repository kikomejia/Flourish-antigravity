"use client";

import React, { useState, useEffect } from "react";
import { useTheme, getPillStyle, getActionButtonStyle, getChallengeButtonStyle } from "@/lib/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import BottomNav from "@/components/BottomNav";
import { VIRTUE_COLORS } from "@/components/VirtueCard";
import { getDailyChallenge } from "@/components/VirtueCard";
import { useAuth } from "@/lib/AuthContext";
// import mocked service to log challenges
import { ActivityLogService, UserStatsService } from "@/lib/services/db";

const VIRTUES = [
  { key: "wisdom", label: "Wisdom", color: "#d8b4fe" },
  { key: "courage", label: "Courage", color: "#fef08a" },
  { key: "humanity", label: "Humanity", color: "#fda4af" },
  { key: "justice", label: "Justice", color: "#86efac" },
  { key: "temperance", label: "Temperance", color: "#ffedd5" },
  { key: "transcendence", label: "Transcendence", color: "#38bdf8" },
];

const DURATION_OPTIONS = [
  { label: "1 Day", days: 1 },
  { label: "3 Days", days: 3 },
  { label: "1 Week", days: 7 },
];

const STORAGE_KEY = "act_challenge_state";

function fireConfetti() {
  const virtueColors = ["#d8b4fe", "#fef08a", "#fda4af", "#86efac", "#ffedd5", "#7dd3fc"];
  const shoot = (origin: any, angle: any) =>
    confetti({ particleCount: 60, spread: 70, angle, origin, colors: virtueColors, scalar: 1.1, gravity: 0.9 });
  shoot({ x: 0.1, y: 0.6 }, 60);
  shoot({ x: 0.9, y: 0.6 }, 120);
  setTimeout(() => { shoot({ x: 0.3, y: 0.5 }, 80); shoot({ x: 0.7, y: 0.5 }, 100); }, 300);
  setTimeout(() => shoot({ x: 0.5, y: 0.4 }, 90), 600);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (state.acceptedChallenge && state.acceptedChallenge.deadline && !state.acceptedChallenge.completed) {
      if (new Date() > new Date(state.acceptedChallenge.deadline)) {
        return { acceptedChallenge: { ...state.acceptedChallenge, expired: true } };
      }
    }
    return state;
  } catch {
    return null;
  }
}

function saveState(state: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export default function ActPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedVirtue, setSelectedVirtue] = useState<string | null>(null);
  const [acceptedChallenge, setAcceptedChallenge] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const state = loadState();
    if (state?.acceptedChallenge) {
      setAcceptedChallenge(state.acceptedChallenge);
    }
  }, []);

  const handleSelectVirtue = (key: string) => {
    if (acceptedChallenge) return;
    setSelectedVirtue(key);
  };

  const handleSelectDuration = async (days: number) => {
    if (!selectedVirtue) return;
    const virtue = selectedVirtue;
    const challenge = getDailyChallenge(virtue);
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    
    const ac = { virtue, challenge, deadline: deadline.toISOString(), completed: false };
    setAcceptedChallenge(ac);
    saveState({ acceptedChallenge: ac });
    setSelectedVirtue(null);

    if (user?.email) {
      ActivityLogService.create({
        user_email: user.email,
        virtue,
        activity_type: "challenge",
        action: "accepted",
        title: challenge.title,
        text: challenge.text,
      });
    }
  };

  const handleComplete = async () => {
    const ac = { ...acceptedChallenge, completed: true };
    setAcceptedChallenge(ac);
    saveState({ acceptedChallenge: ac });
    fireConfetti();

    if (user?.email) {
      ActivityLogService.create({
        user_email: user.email,
        virtue: acceptedChallenge.virtue,
        activity_type: "challenge",
        action: "completed",
        title: acceptedChallenge.challenge.title,
        text: acceptedChallenge.challenge.text,
      });
    }
  };

  const handleReset = () => {
    setAcceptedChallenge(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const filteredVirtues = activeFilter ? VIRTUES.filter(v => v.key === activeFilter) : VIRTUES;

  const timeLeft = () => {
    if (!acceptedChallenge?.deadline) return "";
    const diff = new Date(acceptedChallenge.deadline).getTime() - new Date().getTime();
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days > 0) return `${days}d ${hours}h left`;
    const mins = Math.floor((diff % 3600000) / 60000);
    return hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col pb-28" style={{ background: theme.bg, color: theme.text }}>
      <div className="flex items-center justify-center px-4 pb-2 pt-16">
        <h1 className="text-xl font-bold tracking-wide" style={{ color: theme.accent, fontFamily: "var(--font-recoleta)", textShadow: theme.headerGlow ? `0 0 20px ${theme.accent}55` : "none" }}>
          Act
        </h1>
      </div>

      {acceptedChallenge && (
        <div className="px-4 mt-4">
          <AnimatePresence>
            {!acceptedChallenge.completed ? (
              <motion.div
                key="active"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
              >
                {(() => {
                  const v = VIRTUES.find(x => x.key === acceptedChallenge.virtue);
                  const color = theme.virtueColors[acceptedChallenge.virtue] || v?.color || theme.accent;
                  const isExpired = !!acceptedChallenge.expired;
                  return (
                    <div
                      className="rounded-2xl p-5 mb-4 border"
                      style={isExpired
                        ? { background: theme.isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)", borderColor: `rgba(128,128,128,0.15)` }
                        : theme.cardGlow
                          ? { background: theme.cardBg, borderColor: `${color}66`, boxShadow: `0 0 24px ${color}33` }
                          : { background: `${color}12`, borderColor: "transparent" }
                      }
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <span
                         className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-md border-0"
                         style={isExpired ? { background: "rgba(128,128,128,0.15)", color: theme.subText } : getPillStyle(theme, color)}
                         >
                         {acceptedChallenge.virtue}
                         </span>
                        <span className="text-sm italic" style={{ color: theme.subText, fontFamily: "var(--font-recoleta)" }}>
                          {isExpired ? "Expired challenge" : "Active challenge"}
                        </span>
                        <span className="ml-auto text-xs font-semibold" style={{ color: isExpired ? theme.subText : color }}>
                          {isExpired ? "Expired" : timeLeft()}
                        </span>
                      </div>
                      <p className="font-bold text-xl mb-3 leading-snug" style={{ color: isExpired ? theme.subText : theme.text }}>{acceptedChallenge.challenge.title}</p>
                      <p className="text-sm leading-relaxed mb-6" style={{ color: theme.mutedText }}>{acceptedChallenge.challenge.text}</p>
                      
                      {isExpired ? (
                        <div className="flex flex-col gap-3">
                          <button
                            onClick={handleComplete}
                            className="w-full py-3 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer"
                            style={{ 
                              background: theme.isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)", 
                              color: theme.subText, 
                              border: `1px solid rgba(128,128,128,0.2)` 
                            }}
                          >
                            Mark as Completed
                          </button>
                          <button
                            onClick={handleReset}
                            className="w-full py-3 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer"
                            style={{ 
                              background: theme.isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)", 
                              color: theme.subText, 
                              border: `1px solid rgba(128,128,128,0.2)` 
                            }}
                          >
                            Start a New Challenge
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleComplete}
                          className="w-full py-3 rounded-full text-sm font-bold transition-all duration-200 border-0 cursor-pointer"
                          style={getActionButtonStyle(theme, color)}
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  );
                })()}
                {!acceptedChallenge.expired && (
                  <p className="text-center text-xs" style={{ color: theme.mutedText }}>
                    A new set of challenges will appear tomorrow
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: theme.virtueColors.justice }} />
                <p className="text-xl font-bold mb-2" style={{ color: theme.text }}>Challenge Completed!</p>
                <p className="text-sm mb-1" style={{ color: theme.subText }}>You earned 10 bonus points</p>
                <button
                  onClick={handleReset}
                  className="mt-6 py-2 px-6 rounded-full text-sm font-bold"
                  style={{ background: theme.inputBg, color: theme.accent, border: `1px solid ${theme.cardBorder}` }}
                >
                  Start another
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {selectedVirtue && !acceptedChallenge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={() => setSelectedVirtue(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md rounded-t-3xl p-6 pb-36"
              style={{ background: theme.isLight ? "#fff" : "rgba(15,5,25,0.98)" }}
              onClick={e => e.stopPropagation()}
            >
              {(() => {
                const v = VIRTUES.find(x => x.key === selectedVirtue);
                const color = theme.virtueColors[selectedVirtue] || v?.color || "#f3afee";
                const challenge = getDailyChallenge(selectedVirtue);
                return (
                  <>
                    <span
                      className="text-xs font-bold tracking-widest uppercase px-3 py-1 inline-block mb-3 border-0"
                      style={getPillStyle(theme, color)}
                    >
                      {selectedVirtue} &middot; Challenge
                    </span>
                    <p className="font-bold text-lg mb-1 leading-snug" style={{ color: theme.text }}>{challenge?.title}</p>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: theme.subText }}>{challenge?.text}</p>
                    <p className="text-sm font-semibold mb-4" style={{ color: theme.subText }}>
                      How long do you need to complete this?
                    </p>
                    <div className="flex gap-3">
                      {DURATION_OPTIONS.map(opt => (
                        <button
                          key={opt.days}
                          onClick={() => handleSelectDuration(opt.days)}
                          className="flex-1 py-3 rounded-full text-sm font-bold transition-all duration-200 border-0"
                          style={theme.isLight
                            ? { background: color, color: "#fff" }
                            : { background: `${color}22`, color, border: `1.5px solid ${color}66`, boxShadow: `0 0 14px ${color}33` }
                          }
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!acceptedChallenge && (
        <div className="px-4 mt-2">
          <p className="text-sm text-center mb-5 px-2 leading-relaxed" style={{ color: theme.subText }}>
            Take on a challenge to strengthen your character through action. You'll have up to 1 week to complete.
          </p>

          <div className="flex gap-2 overflow-x-auto pb-3 mb-4" style={{ scrollbarWidth: "none" }}>
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

          <div className="space-y-3">
            {filteredVirtues.map(v => {
              const challenge = getDailyChallenge(v.key);
              const color = theme.virtueColors[v.key] || v.color;
              return (
                <motion.div
                  key={v.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl p-5 cursor-pointer border"
                  style={theme.cardGlow
                    ? { background: theme.cardBg, borderColor: `${color}66`, boxShadow: `0 0 24px ${color}33` }
                    : { background: `${color}12`, borderColor: "transparent" }
                  }
                  onClick={() => handleSelectVirtue(v.key)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-md border-0"
                      style={getPillStyle(theme, color)}
                    >
                      {v.label}
                    </span>
                    <span className="text-sm italic" style={{ color: theme.subText, fontFamily: "var(--font-recoleta)" }}>
                      Challenge
                    </span>
                  </div>
                  <p className="font-bold text-xl mb-2 leading-snug" style={{ color: theme.text }}>{challenge?.title}</p>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: theme.subText }}>{challenge?.text}</p>
                  <div
                    className="w-full py-3 rounded-full text-sm font-bold text-center"
                    style={{ ...getChallengeButtonStyle(theme, color) }}
                  >
                    Take this challenge
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <BottomNav active="act" />
    </div>
  );
}
