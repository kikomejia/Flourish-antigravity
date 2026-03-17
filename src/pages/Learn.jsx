import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { generateLearningContent } from "@/functions/generateLearningContent";
import BottomNav from "@/components/BottomNav";
import { BookOpen, Lightbulb, Zap, FlaskConical } from "lucide-react";
import { VIRTUE_COLORS } from "@/components/VirtueCard";
import { format } from "date-fns";

function getTodayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

function Section({ icon, title, children, theme }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-px" style={{ background: `${theme.accent}30` }} />
        <div className="flex items-center gap-2">
          {React.cloneElement(icon, { style: { color: theme.accent } })}
          <span className="text-xs tracking-widest uppercase font-semibold" style={{ color: theme.accent }}>{title}</span>
        </div>
        <div className="flex-1 h-px" style={{ background: `${theme.accent}30` }} />
      </div>
      {children}
    </div>
  );
}

export default function Learn() {
  const { theme } = useTheme();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasActivities, setHasActivities] = useState(false);

  const CACHE_KEY = `learn_cache_${getTodayStr()}`;

  const getTodayActivities = async () => {
    let activityLogs = [];
    let userName = "Seeker";
    try {
      const u = await base44.auth.me();
      if (u?.email) {
        userName = u.full_name || "Seeker";
        const all = await base44.entities.ActivityLog.filter({ user_email: u.email }, "-created_date", 50);
        activityLogs = all.filter(a => a.created_date && format(new Date(a.created_date), "yyyy-MM-dd") === getTodayStr() && a.activity_type === "pledge");
      }
    } catch {
      const all = JSON.parse(localStorage.getItem("guest_activities") || "[]");
      activityLogs = all.filter(a => a.created_date && format(new Date(a.created_date), "yyyy-MM-dd") === getTodayStr() && a.activity_type === "pledge");
    }
    return { activityLogs, userName };
  };

  const fetchContent = async (force = false) => {
    const { activityLogs, userName } = await getTodayActivities();
    if (activityLogs.length === 0) {
      setHasActivities(false);
      setLoading(false);
      return;
    }
    setHasActivities(true);
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (!force && cached && cached.activityCount === activityLogs.length) {
      setContent(cached.content);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await generateLearningContent({ activityLogs, userName });
      const newContent = res.data;
      localStorage.setItem(CACHE_KEY, JSON.stringify({ content: newContent, activityCount: activityLogs.length }));
      setContent(newContent);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContent(); }, []);

  // Resolve color from theme if available, else fall back to static map
  const getColor = (virtueName) =>
    (virtueName && (theme.virtueColors[virtueName.toLowerCase()] || VIRTUE_COLORS[virtueName.toLowerCase()])) || theme.accent;

  return (
    <div className="min-h-screen pb-28" style={{ background: theme.bg, color: theme.text }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="w-8" />
        <h1 className="text-xl font-bold tracking-wide" style={{ color: theme.accent, fontFamily: "serif", textShadow: `0 0 20px ${theme.accent}55` }}>
          Learn
        </h1>
        <div className="w-8" />
      </div>

      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${theme.accent}30`, borderTopColor: theme.accent }} />
            <p className="text-xs text-center px-6 leading-relaxed" style={{ color: theme.mutedText }}>
              Generating insights based on today's accepted pledges. Hold tight!
            </p>
          </div>
        ) : !hasActivities ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
            <BookOpen size={32} style={{ color: theme.accent }} />
            <p className="text-sm" style={{ color: theme.subText }}>
              Accept today's pledges to unlock your learning insights.
            </p>
          </div>
        ) : content ? (
          <>
            {/* Practical Takeaways */}
            <Section theme={theme} icon={<Lightbulb size={13} />} title="Practical Takeaways">
              <div className="space-y-3">
                {content.practical_takeaways?.map((item, i) => {
                  const color = getColor(item.virtue);
                  return (
                    <div key={i} className="rounded-xl p-4" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                      <span
                        className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded inline-block mb-2"
                        style={{ background: color, color: theme.pillTextColor || "#fff" }}
                      >{item.virtue}</span>
                      <p className="text-sm font-semibold mb-1" style={{ color: theme.text }}>{item.title}</p>
                      <p className="text-sm leading-relaxed" style={{ color: theme.subText }}>{item.explanation}</p>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* Virtues as Functional Skills */}
            <Section theme={theme} icon={<Zap size={13} />} title="Virtues as Functional Skills">
              <div className="space-y-3">
                {content.virtues_as_functional_skills?.map((item, i) => {
                  const color = getColor(item.virtue);
                  return (
                    <div key={i} className="flex items-start gap-3 rounded-xl p-3" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
                      <div>
                        <span
                          className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded inline-block mb-1"
                          style={{ background: color, color: theme.pillTextColor || "#fff" }}
                        >{item.virtue}</span>
                        <p className="text-sm leading-relaxed" style={{ color: theme.subText }}>{item.skill}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* Hard-Hitting Resources */}
            <Section theme={theme} icon={<BookOpen size={13} />} title="Hard-Hitting Resources">
              <div className="space-y-3">
                {content.hard_hitting_resources?.map((item, i) => {
                  const color = getColor(item.virtue);
                  return (
                    <div key={i} className="rounded-xl p-4" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded"
                          style={{ background: color, color: theme.pillTextColor || "#fff" }}
                        >{item.virtue}</span>
                        <span style={{ color: theme.mutedText }} className="text-xs">•</span>
                        <span className="text-sm font-semibold" style={{ color: theme.text }}>{item.author_source}</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: theme.subText }}>{item.why_it_matters}</p>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* Real-World Facts */}
            <Section theme={theme} icon={<FlaskConical size={13} />} title="Real-World Facts">
              <div className="space-y-3">
                {content.real_world_facts?.map((item, i) => {
                  const [title, ...rest] = item.split(":");
                  return (
                    <div key={i} className="rounded-xl p-4" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                      <p className="text-sm leading-relaxed" style={{ color: theme.subText }}>
                        {rest.length > 0 ? (
                          <><span className="font-bold" style={{ color: theme.text }}>{title}:</span>{rest.join(":")}</>
                        ) : item}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Section>
          </>
        ) : null}
      </div>

      <BottomNav active="learn" />
    </div>
  );
}