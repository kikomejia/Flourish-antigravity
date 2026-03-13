import React, { useState } from "react";
import { CheckCircle, Circle } from "lucide-react";

const VIRTUE_CHALLENGES = {
  wisdom: [
    { challenge: "Read for 20 minutes on a topic you know little about.", pledge: "I will seek knowledge before forming opinions." },
    { challenge: "Write down 3 lessons you've learned from a past mistake.", pledge: "I will treat failures as teachers." },
    { challenge: "Ask someone a deep question and truly listen to their answer.", pledge: "I will listen more than I speak." },
    { challenge: "Reflect on a belief you hold — try to argue the opposite side.", pledge: "I will stay open to being wrong." },
    { challenge: "Spend 10 minutes in silence thinking about a current problem.", pledge: "I will think before I act." },
    { challenge: "Summarize something complex you learned in simple words.", pledge: "I will seek clarity over complexity." },
    { challenge: "Identify one thing you're certain of — then question it.", pledge: "I will embrace intellectual humility." },
  ],
  courage: [
    { challenge: "Have a conversation you've been avoiding.", pledge: "I will not let fear silence me." },
    { challenge: "Share an honest opinion in a social setting.", pledge: "I will stand by my convictions." },
    { challenge: "Do one thing today that makes you uncomfortable.", pledge: "I will grow through discomfort." },
    { challenge: "Admit a mistake to someone you wronged.", pledge: "I will own my errors with courage." },
    { challenge: "Set a boundary you've been afraid to set.", pledge: "I will respect my own limits." },
    { challenge: "Start a project you've been postponing out of fear.", pledge: "I will act despite uncertainty." },
    { challenge: "Express a vulnerable emotion to someone you trust.", pledge: "I will have the courage to be seen." },
  ],
  humanity: [
    { challenge: "Do something kind for someone without expecting anything back.", pledge: "I will give freely." },
    { challenge: "Reach out to someone who might be feeling lonely.", pledge: "I will notice those who feel invisible." },
    { challenge: "Forgive someone (or yourself) for something from the past.", pledge: "I will choose peace over resentment." },
    { challenge: "Spend quality time with someone you care about — no phones.", pledge: "I will be fully present." },
    { challenge: "Compliment someone sincerely and specifically.", pledge: "I will lift others up." },
    { challenge: "Volunteer your time or skills for a cause or person.", pledge: "I will serve where I can." },
    { challenge: "Practice empathy — imagine someone else's full experience today.", pledge: "I will see through others' eyes." },
  ],
  justice: [
    { challenge: "Stand up for someone who is being treated unfairly.", pledge: "I will not be a bystander." },
    { challenge: "Reflect on a personal bias and challenge it.", pledge: "I will examine my prejudices." },
    { challenge: "Make a decision today based purely on fairness, not convenience.", pledge: "I will choose what's right over what's easy." },
    { challenge: "Acknowledge a privilege you have that others don't.", pledge: "I will use my advantages to lift others." },
    { challenge: "Give someone the benefit of the doubt today.", pledge: "I will assume good intent." },
    { challenge: "Ensure your words and actions are consistent today.", pledge: "I will be a person of integrity." },
    { challenge: "Take responsibility for something that went wrong.", pledge: "I will be accountable." },
  ],
  temperance: [
    { challenge: "Abstain from one habit or indulgence for the entire day.", pledge: "I will master my impulses." },
    { challenge: "Eat one meal slowly and mindfully, without screens.", pledge: "I will be present with nourishment." },
    { challenge: "When you feel reactive, pause for 5 full breaths before responding.", pledge: "I will respond, not react." },
    { challenge: "Limit social media to 30 minutes total today.", pledge: "I will guard my attention." },
    { challenge: "Finish one task completely before starting another.", pledge: "I will cultivate focus." },
    { challenge: "Go to bed at a consistent time and honor your sleep.", pledge: "I will respect my body's needs." },
    { challenge: "Spend 15 minutes in stillness — no input, no stimulation.", pledge: "I will befriend silence." },
  ],
  transcendence: [
    { challenge: "Spend 10 minutes in gratitude — write down 5 things you appreciate.", pledge: "I will not take the gift of today for granted." },
    { challenge: "Do something creative purely for the joy of it.", pledge: "I will honor my inner life." },
    { challenge: "Spend time in nature and truly observe your surroundings.", pledge: "I will connect with the world beyond myself." },
    { challenge: "Meditate or pray for 10 minutes with full focus.", pledge: "I will tend to my spirit." },
    { challenge: "Find beauty in something ordinary today.", pledge: "I will cultivate wonder." },
    { challenge: "Reflect on your life's purpose — write one sentence about it.", pledge: "I will live with intention." },
    { challenge: "Perform an act of beauty — music, art, or a kind gesture.", pledge: "I will add beauty to the world." },
  ],
};

const VIRTUE_COLORS = {
  wisdom: "#60efff",
  courage: "#ffb347",
  humanity: "#ff6eb4",
  justice: "#90ee90",
  temperance: "#da70d6",
  transcendence: "#c8a2c8",
};

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function VirtueCard({ virtue, isCompleted, onComplete }) {
  const [pledged, setPledged] = useState(false);
  const color = VIRTUE_COLORS[virtue];
  const challenges = VIRTUE_CHALLENGES[virtue];
  const dayIndex = getDayOfYear() % challenges.length;
  const { challenge, pledge } = challenges[dayIndex];

  const handleComplete = () => {
    if (!isCompleted) {
      onComplete(virtue);
    }
  };

  return (
    <div
      className="rounded-xl p-5 border transition-all duration-300"
      style={{
        background: "rgba(10,10,20,0.9)",
        borderColor: isCompleted ? color : "rgba(255,255,255,0.08)",
        boxShadow: isCompleted ? `0 0 20px ${color}33` : "none",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-sm font-bold tracking-widest uppercase"
          style={{ color, fontFamily: "monospace" }}
        >
          {virtue}
        </h3>
        {isCompleted && (
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}>
            Done
          </span>
        )}
      </div>

      <p className="text-white text-sm leading-relaxed mb-4 opacity-90">{challenge}</p>

      <div
        className="rounded-lg p-3 mb-4 text-xs italic opacity-75 leading-relaxed"
        style={{ background: `${color}11`, borderLeft: `2px solid ${color}55`, color: "rgba(255,255,255,0.7)" }}
      >
        "{pledge}"
      </div>

      {!isCompleted && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-white/60 hover:text-white/90 transition-colors">
            <input
              type="checkbox"
              checked={pledged}
              onChange={(e) => setPledged(e.target.checked)}
              className="hidden"
            />
            {pledged ? (
              <CheckCircle size={16} style={{ color }} />
            ) : (
              <Circle size={16} className="opacity-40" />
            )}
            I pledge to uphold this today
          </label>

          <button
            onClick={handleComplete}
            disabled={!pledged}
            className="w-full py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200"
            style={{
              background: pledged ? `${color}22` : "rgba(255,255,255,0.03)",
              color: pledged ? color : "rgba(255,255,255,0.2)",
              border: `1px solid ${pledged ? color + "66" : "rgba(255,255,255,0.05)"}`,
              cursor: pledged ? "pointer" : "not-allowed",
              boxShadow: pledged ? `0 0 12px ${color}33` : "none",
            }}
          >
            Mark as Complete
          </button>
        </div>
      )}
    </div>
  );
}

export { VIRTUE_COLORS, VIRTUE_CHALLENGES };