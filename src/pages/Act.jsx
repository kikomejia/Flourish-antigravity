import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import BottomNav from "@/components/BottomNav";
import { VIRTUE_COLORS } from "@/components/VirtueCard";
import { getDailyChallenge } from "@/components/VirtueCard";

const VIRTUES = [
  { key: "wisdom", label: "Wisdom", color: "#d8b4fe" },
  { key: "courage", label: "Courage", color: "#fef08a" },
  { key: "humanity", label: "Humanity", color: "#fda4af" },
  { key: "justice", label: "Justice", color: "#86efac" },
  { key: "temperance", label: "Temperance", color: "#ffedd5" },
  { key: "transcendence", label: "Transcendence", color: "#7dd3fc" },
];

const DURATION_OPTIONS = [
  { label: "1 Day", days: 1 },
  { label: "3 Days", days: 3 },
  { label: "1 Week", days: 7 },
];

const STORAGE_KEY = "act_challenge_state";

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
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

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    // Check if challenge has expired
    if (state.acceptedChallenge && state.deadline) {
      if (new Date() > new Date(state.deadline)) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
    }
    return state;
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export default function Act() {
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedVirtue, setSelectedVirtue] = useState(null); // virtue key user tapped
  const [acceptedChallenge, setAcceptedChallenge] = useState(null); // { virtue, challenge, deadline, completed }
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
    const state = loadState();
    if (state?.acceptedChallenge) {
      setAcceptedChallenge(state.acceptedChallenge);
    }
  }, []);

  const handleSelectVirtue = (key) => {
    if (acceptedChallenge) return;
    setSelectedVirtue(key);
  };

  const handleSelectDuration = (days) => {
    const virtue = selectedVirtue;
    const challenge = getDailyChallenge(virtue);
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    const ac = { virtue, challenge, deadline: deadline.toISOString(), completed: false };
    setAcceptedChallenge(ac);
    saveState({ acceptedChallenge: ac });
    setSelectedVirtue(null);
  };

  const handleComplete = async () => {
    const ac = { ...acceptedChallenge, completed: true };
    setAcceptedChallenge(ac);
    saveState({ acceptedChallenge: ac });
    fireConfetti();

    // Award 10 points
    try {
      const u = user || await base44.auth.me().catch(() => null);
      if (u?.email) {
        const statsArr = await base44.entities.UserStats.filter({ user_email: u.email });
        const existing = statsArr[0];
        if (existing) {
          const totalPoints = (existing.total_points || 0) + 10;
          await base44.entities.UserStats.update(existing.id, {
            total_points: totalPoints,
            level: Math.floor(totalPoints / 100) + 1,
          });
        } else {
          await base44.entities.UserStats.create({
            user_email: u.email,
            total_points: 10,
            level: 1,
            current_streak: 0,
            longest_streak: 0,
            total_completions: 0,
          });
        }
        await base44.entities.ActivityLog.create({
          user_email: u.email,
          virtue: acceptedChallenge.virtue,
          activity_type: "challenge",
          action: "completed",
          title: acceptedChallenge.challenge.title,
          text: acceptedChallenge.challenge.text,
        });
      } else {
        // Guest
        const prevStats = JSON.parse(localStorage.getItem("guest_stats") || "{}");
        const totalPoints = (prevStats.total_points || 0) + 10;
        localStorage.setItem("guest_stats", JSON.stringify({ ...prevStats, total_points: totalPoints, level: Math.floor(totalPoints / 100) + 1 }));
      }
    } catch {}
  };

  const handleReset = () => {
    setAcceptedChallenge(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const filteredVirtues = activeFilter ? VIRTUES.filter(v => v.key === activeFilter) : VIRTUES;

  const timeLeft = () => {
    if (!acceptedChallenge?.deadline) return "";
    const diff = new Date(acceptedChallenge.deadline) - new Date();
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days > 0) return `${days}d ${hours}h left`;
    const mins = Math.floor((diff % 3600000) / 60000);
    return hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;
  };

  return (
    <div className="min-h-screen flex flex-col pb-28" style={{ background: "#050508", color: "white" }}>
      {/* Header */}
      <div className="flex items-center justify-center px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold tracking-wide" style={{ color: "#f3afee", fontFamily: "serif", textShadow: "0 0 20px #f3afee55" }}>
          Act
        </h1>
      </div>

      {/* Active challenge view */}
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
                {/* Challenge card */}
                {(() => {
                  const v = VIRTUES.find(x => x.key === acceptedChallenge.virtue);
                  const color = v?.color || "#f3afee";
                  return (
                    <div
                      className="rounded-2xl p-5 mb-4"
                      style={{
                        background: "rgba(15,5,25,0.97)",
                        border: `1px solid ${color}99`,
                        boxShadow: `0 0 28px ${color}44`,
                      }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <span
                          className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-md"
                          style={{ background: `${color}22`, color, border: `1px solid ${color}66` }}
                        >
                          {acceptedChallenge.virtue}
                        </span>
                        <span className="text-sm italic" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "serif" }}>
                          Active challenge
                        </span>
                        <span className="ml-auto text-xs font-semibold" style={{ color: `${color}cc` }}>
                          {timeLeft()}
                        </span>
                      </div>
                      <p className="text-white font-bold text-xl mb-3 leading-snug">{acceptedChallenge.challenge.title}</p>
                      <p className="text-white/60 text-sm leading-relaxed mb-6">{acceptedChallenge.challenge.text}</p>
                      <button
                        onClick={handleComplete}
                        className="w-full py-3 rounded-full text-sm font-bold transition-all duration-200"
                        style={{ background: color, color: "#0a0a14", boxShadow: `0 0 20px ${color}66` }}
                      >
                        Mark as Completed
                      </button>
                    </div>
                  );
                })()}
                <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                  A new set of challenges will appear tomorrow
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: "#86efac" }} />
                <p className="text-xl font-bold text-white mb-2">Challenge Completed!</p>
                <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>You earned 10 bonus points</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                  A new set of challenges will appear tomorrow
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Duration picker modal */}
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
              style={{ background: "rgba(15,5,25,0.98)", border: "1px solid rgba(243,175,238,0.2)" }}
              onClick={e => e.stopPropagation()}
            >
              {(() => {
                const v = VIRTUES.find(x => x.key === selectedVirtue);
                const color = v?.color || "#f3afee";
                const challenge = getDailyChallenge(selectedVirtue);
                return (
                  <>
                    <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color }}>
                      {selectedVirtue} · Challenge
                    </p>
                    <p className="text-white font-bold text-lg mb-1 leading-snug">{challenge?.title}</p>
                    <p className="text-white/50 text-sm leading-relaxed mb-6">{challenge?.text}</p>
                    <p className="text-sm font-semibold mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
                      How long do you need to complete this?
                    </p>
                    <div className="flex gap-3">
                      {DURATION_OPTIONS.map(opt => (
                        <button
                          key={opt.days}
                          onClick={() => handleSelectDuration(opt.days)}
                          className="flex-1 py-3 rounded-full text-sm font-bold transition-all duration-200"
                          style={{
                            background: `${color}22`,
                            color,
                            border: `1.5px solid ${color}66`,
                            boxShadow: `0 0 14px ${color}33`,
                          }}
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

      {/* Challenge cards grid — only shown when no active challenge */}
      {!acceptedChallenge && (
        <div className="px-4 mt-2">
          <p className="text-sm text-center mb-5 px-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
            Take on a challenge to strengthen your character through action. You'll have up to 1 week to complete.
          </p>

          {/* Virtue filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4" style={{ scrollbarWidth: "none" }}>
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

          {/* Cards */}
          <div className="space-y-3">
            {filteredVirtues.map(v => {
              const challenge = getDailyChallenge(v.key);
              const color = v.color;
              return (
                <motion.div
                  key={v.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl p-5 cursor-pointer"
                  style={{
                    background: "rgba(15,5,25,0.97)",
                    border: `1px solid ${color}55`,
                    boxShadow: `0 0 16px ${color}18`,
                  }}
                  onClick={() => handleSelectVirtue(v.key)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-md"
                      style={{ background: `${color}22`, color, border: `1px solid ${color}66` }}
                    >
                      {v.label}
                    </span>
                    <span className="text-sm italic" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "serif" }}>
                      Challenge
                    </span>
                  </div>
                  <p className="text-white font-bold text-xl mb-2 leading-snug">{challenge?.title}</p>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">{challenge?.text}</p>
                  <div
                    className="w-full py-3 rounded-full text-sm font-bold text-center"
                    style={{ background: `${color}22`, color, border: `1.5px solid ${color}66` }}
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