import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/ThemeContext";
import { getPillStyle, getChallengeButtonStyle } from "@/lib/ThemeContext";
import { TrendingUp } from "lucide-react";

// The 6 petal paths from VirtueHexagon — fill colors are Sakura theme colors
const PETALS = [
  { key: "transcendence", d: "M2333.28,2546.38c-0,-0 -982.087,-124.257 -1712.12,-0c-165.13,-6.532 -884.89,-493.869 -471.965,-1263.48c312.729,-547.051 1006.9,-521.347 1308.79,-228.583c430.052,417.047 875.295,1492.06 875.295,1492.06Z", color: "#1565C0" },
  { key: "temperance", d: "M2334.82,2548.81c0,-0 -598.949,788.158 -856.619,1482.42c-88.274,139.707 -870.343,519.075 -1330.1,-223.507c-317.191,-544.476 52.375,-1132.65 456.906,-1247.57c576.262,-163.696 1729.82,-11.345 1729.82,-11.345Z", color: "#4F5D75" },
  { key: "justice", d: "M2329.99,2550.11c-0,0 384.089,912.365 857.126,1482.13c77.012,146.216 15.469,1013.26 -857.476,1041.09c-630.122,3.148 -955.387,-610.639 -853.086,-1018.54c145.73,-581.065 853.436,-1504.67 853.436,-1504.67Z", color: "#1A7A4A" },
  { key: "humanity", d: "M2333.28,2549.14c-0,-0 982.063,124.437 1712.12,0.315c165.128,6.562 884.798,494.032 471.732,1263.57c-312.829,546.994 -1006.99,521.162 -1308.83,228.342c-429.975,-417.126 -875.02,-1492.22 -875.02,-1492.22Z", color: "#C0356A" },
  { key: "courage", d: "M2330.64,2551.1c0,0 599.991,-787.366 858.578,-1481.29c88.459,-139.59 871.028,-517.923 1329.81,225.266c316.471,544.894 -53.873,1132.58 -458.555,1246.96c-576.477,162.934 -1729.83,9.059 -1729.83,9.059Z", color: "#C07000" },
  { key: "wisdom", d: "M2337.22,2546.38c0,-0 -384.778,-912.075 -858.245,-1481.48c-77.124,-146.159 -16.235,-1013.25 856.688,-1041.74c630.12,-3.624 955.849,609.918 853.856,1017.9c-145.291,581.174 -852.299,1505.32 -852.299,1505.32Z", color: "#8E44AD" },
];

// Mini flywheel SVG — transparent with border color
function MiniFlywheelSVG({ size = 60, borderColor = "#2D3142", opacity = 1 }) {
  return (
    <svg
      width={size}
      height={size * 1.13}
      viewBox="-600 -500 5867 6200"
      style={{ overflow: "visible", opacity }}
    >
      {PETALS.map((p) => (
        <path
          key={p.key}
          d={p.d}
          fill="transparent"
          stroke={borderColor}
          strokeWidth={55}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity={0.75}
        />
      ))}
    </svg>
  );
}

// Scattered flywheels for slide 1 — fully visible, no clipping at top
const SCATTER = [
  { size: 32,  x: 12,  y: 18,  rotate: -15, opacity: 0.7 },
  { size: 58,  x: 52,  y: 12,  rotate: 10,  opacity: 0.85 },
  { size: 42,  x: 88,  y: 22,  rotate: 25,  opacity: 0.75 },
  { size: 78,  x: 28,  y: 52,  rotate: -5,  opacity: 0.9 },
  { size: 28,  x: 74,  y: 55,  rotate: 40,  opacity: 0.65 },
  { size: 50,  x: 6,   y: 72,  rotate: 20,  opacity: 0.75 },
  { size: 38,  x: 90,  y: 75,  rotate: -30, opacity: 0.7 },
  { size: 24,  x: 60,  y: 80,  rotate: 15,  opacity: 0.6 },
  { size: 44,  x: 38,  y: 88,  rotate: -20, opacity: 0.7 },
];

// Unique drift params per flywheel so they move independently
const DRIFT = [
  { duration: 9,  delay: 0,    dx: 18, dy: -6  },
  { duration: 12, delay: 1.5,  dx: 22, dy: -4  },
  { duration: 10, delay: 0.8,  dx: 15, dy: -8  },
  { duration: 14, delay: 2.2,  dx: 20, dy: -5  },
  { duration: 8,  delay: 0.4,  dx: 25, dy: -7  },
  { duration: 11, delay: 1.8,  dx: 17, dy: -3  },
  { duration: 13, delay: 0.6,  dx: 12, dy: -6  },
  { duration: 9,  delay: 2.8,  dx: 21, dy: -9  },
  { duration: 10, delay: 1.2,  dx: 16, dy: -4  },
];

function ScatteredFlywheels({ borderColor }) {
  return (
    <div className="relative w-full" style={{ height: 260, overflow: "visible" }}>
      {SCATTER.map((s, i) => {
        const d = DRIFT[i];
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              transform: `translate(-50%, -50%) rotate(${s.rotate}deg)`,
            }}
            animate={{
              x: [0, d.dx, 0],
              y: [0, d.dy, 0],
            }}
            transition={{
              duration: d.duration,
              delay: d.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <MiniFlywheelSVG size={s.size} borderColor={borderColor} opacity={s.opacity} />
          </motion.div>
        );
      })}
    </div>
  );
}

// Sample challenges for the slide 3 animation
const SAMPLE_CHALLENGES = [
  { virtue: "Courage", color: "#C07000", title: "Strike up a brief, genuine conversation with someone you don't know" },
  { virtue: "Wisdom", color: "#8E44AD", title: "Find a valid point in a perspective you'd normally disagree with" },
  { virtue: "Humanity", color: "#C0356A", title: "Tell someone in your life three very specific things you appreciate about them and why" },
];

function ChallengeCardsAnimation({ theme }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    const timers = SAMPLE_CHALLENGES.map((_, i) =>
      setTimeout(() => setVisibleCount(i + 1), 300 + i * 700)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full flex flex-col justify-start gap-2" style={{ height: 260 }}>
      {SAMPLE_CHALLENGES.map((c, i) => {
        const color = theme.isLight ? c.color : (
          i === 0 ? "#fef08a" : i === 1 ? "#d8b4fe" : "#fda4af"
        );
        const cardStyle = theme.cardGlow
          ? { background: theme.cardBg, border: `1px solid ${color}55`, boxShadow: `0 0 16px ${color}22` }
          : { background: `${color}10`, border: "none" };

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={i < visibleCount ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 14, scale: 0.97 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="rounded-xl px-4 py-2.5"
            style={cardStyle}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded"
                style={getPillStyle(theme, color)}
              >
                {c.virtue}
              </span>
              <span className="text-xs italic" style={{ color: theme.subText, fontFamily: "serif" }}>Challenge</span>
            </div>
            <p className="text-sm font-bold leading-snug" style={{ color: theme.text }}>{c.title}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

// Animated flywheel for slide 2: petals fill one by one, then virtue names appear
function AnimatedFlywheelSVG({ borderColor }) {
  const [filledCount, setFilledCount] = useState(0);

  useEffect(() => {
    setFilledCount(0);
    const timers = PETALS.map((_, i) =>
      setTimeout(() => setFilledCount(i + 1), 400 + i * 500)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center" style={{ height: 260 }}>
      {/* Flywheel */}
      <svg
        width={160}
        height={181}
        viewBox="-600 -500 5867 6200"
        style={{ overflow: "visible", marginBottom: 12 }}
      >
        {PETALS.map((p, i) => {
          const filled = i < filledCount;
          return (
            <path
              key={p.key}
              d={p.d}
              fill={filled ? `${p.color}55` : "transparent"}
              stroke={filled ? p.color : borderColor}
              strokeWidth={55}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={filled ? 0.9 : 0.6}
              style={{ transition: "all 0.4s ease" }}
            />
          );
        })}
      </svg>

      {/* Virtue name pills */}
      <div className="flex flex-wrap justify-center gap-1.5" style={{ maxWidth: 280 }}>
        {PETALS.map((p, i) => {
          const filled = i < filledCount;
          return (
            <motion.span
              key={p.key}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={filled ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-xs font-bold tracking-widest uppercase px-2.5 py-0.5 rounded"
              style={{
                background: `${p.color}22`,
                color: p.color,
                border: `1.5px solid ${p.color}88`,
              }}
            >
              {p.key}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}

export default function Onboarding({ onComplete }) {
  const { theme } = useTheme();
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);

  // Use dark border for orchid (light theme), accent for glow
  const flywheelBorder = theme.isLight ? "#2D3142" : theme.accent;

  const SLIDES = [
    {
      visual: <ScatteredFlywheels borderColor={flywheelBorder} />,
      headline: "Welcome to Flourish",
      body: "Your daily guide to cultivate virtues, build character, and grow into the best version of yourself.",
    },
    {
      visual: <AnimatedFlywheelSVG borderColor={flywheelBorder} />,
      headline: "Start Your Day Strong",
      body: "Tap on the Virtue Flywheel petals to accept a daily pledge for each of the 6 virtues. Complete all 6 to earn daily points!",
    },
    {
      visual: <ChallengeCardsAnimation theme={theme} />,
      headline: "Go Deeper with Challenges",
      body: "Take on character-building challenges in the 'Act' tab to test yourself and earn extra points.",
    },
    {
      visual: (
        <div className="flex items-center justify-center w-full h-full">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: `${theme.accent}18`, border: `1.5px solid ${theme.accent}44` }}
          >
            <TrendingUp size={40} style={{ color: theme.accent }} />
          </div>
        </div>
      ),
      headline: "Watch Your Character Flourish",
      body: "Track your points, streaks, and achievements in the You tab. Every day is a new chance to grow.",
    },
  ];

  const goTo = (next) => {
    setDir(next > current ? 1 : -1);
    setCurrent(next);
  };

  const handleNext = () => {
    if (current < SLIDES.length - 1) goTo(current + 1);
    else onComplete();
  };

  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: theme.bg }}
    >
      {/* Skip */}
      {!isLast && (
        <button
          onClick={onComplete}
          className="absolute right-6 text-xs tracking-widest uppercase"
          style={{ color: theme.mutedText, top: "calc(env(safe-area-inset-top) + 16px)" }}
        >
          Skip
        </button>
      )}

      {/* Slide content */}
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Fixed-height visual area so text never jumps */}
        <div className="w-full flex items-center justify-center" style={{ height: 260 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current + "-visual"}
              initial={{ opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -dir * 60 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex items-start justify-center w-full h-full"
            >
              {slide.visual}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Fixed text block — always at same vertical position */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current + "-text"}
            initial={{ opacity: 0, x: dir * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -dir * 60 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col items-center text-center w-full mt-6"
          >
            <h2
              className="text-2xl font-bold mb-4 leading-snug"
              style={{ color: theme.text, fontFamily: "serif" }}
            >
              {slide.headline}
            </h2>
            <p className="text-base leading-relaxed" style={{ color: theme.subText }}>
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

      {/* CTA */}
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