import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/ThemeContext";
import { Sparkles, Hand, Zap, TrendingUp } from "lucide-react";

const SLIDES = [
  {
    icon: Sparkles,
    headline: "Welcome to Flourish",
    body: "Your daily guide to cultivate virtues, build character, and grow into the best version of yourself.",
  },
  {
    icon: Hand,
    headline: "Start Your Day Strong",
    body: "Tap on the Virtue Hexagon petals to accept a daily pledge for each of the 6 virtues. Complete all 6 to earn daily points!",
  },
  {
    icon: Zap,
    headline: "Go Deeper with Challenges",
    body: "Take on longer challenges in the Act tab to earn bonus points. The Learn tab then gives you personalized insights based on your progress.",
  },
  {
    icon: TrendingUp,
    headline: "Watch Your Character Flourish",
    body: "Track your points, streaks, and achievements in the You tab. Every day is a new chance to grow.",
  },
];

export default function Onboarding({ onComplete }) {
  const { theme } = useTheme();
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);

  const goTo = (next) => {
    setDir(next > current ? 1 : -1);
    setCurrent(next);
  };

  const handleNext = () => {
    if (current < SLIDES.length - 1) {
      goTo(current + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => onComplete();

  const slide = SLIDES[current];
  const Icon = slide.icon;
  const isLast = current === SLIDES.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: theme.bg }}
    >
      {/* Skip */}
      {!isLast && (
        <button
          onClick={handleSkip}
          className="absolute top-4 right-6 text-xs tracking-widest uppercase"
          style={{ color: theme.mutedText, paddingTop: "calc(env(safe-area-inset-top) + 8px)" }}
        >
          Skip
        </button>
      )}

      {/* Slide content */}
      <div className="w-full max-w-sm flex flex-col items-center" style={{ minHeight: 320 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current}
            custom={dir}
            initial={{ opacity: 0, x: dir * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -dir * 60 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col items-center text-center"
          >
            {/* Icon circle */}
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-8"
              style={{ background: `${theme.accent}18`, border: `1.5px solid ${theme.accent}44` }}
            >
              <Icon size={40} style={{ color: theme.accent }} />
            </div>

            <h2
              className="text-2xl font-bold mb-4 leading-snug"
              style={{ color: theme.text, fontFamily: "serif" }}
            >
              {slide.headline}
            </h2>
            <p
              className="text-base leading-relaxed"
              style={{ color: theme.subText }}
            >
              {slide.body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex gap-2 mt-10 mb-8">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 20 : 8,
              height: 8,
              background: i === current ? theme.accent : `${theme.accent}33`,
            }}
          />
        ))}
      </div>

      {/* CTA Button */}
      <button
        onClick={handleNext}
        className="w-full max-w-sm py-4 rounded-full text-base font-bold transition-all duration-200"
        style={{
          background: theme.accent,
          color: theme.isLight ? "#fff" : "#1a0a1a",
          boxShadow: theme.headerGlow ? `0 0 24px ${theme.accent}55` : "none",
        }}
      >
        {isLast ? "Get Started" : "Next"}
      </button>
    </div>
  );
}