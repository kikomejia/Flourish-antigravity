import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useTheme, getPillStyle, getVirtueCardStyle } from "@/lib/ThemeContext.jsx";
import PLEDGE_LEARNING_CONTENT from "@/lib/pledgeLearningContent";
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

// Build the content object from hardcoded data, given the list of today's activity logs
function buildContentFromPledges(activityLogs) {
  const practical_takeaways = [];
  const virtues_as_functional_skills = [];
  const hard_hitting_resources = [];
  const real_world_facts = [];

  const seenResources = new Set();

  for (const act of activityLogs) {
    const entry = PLEDGE_LEARNING_CONTENT[act.title];
    if (!entry) continue;

    practical_takeaways.push({
      virtue: entry.virtue,
      title: entry.practical_takeaway.title,
      explanation: entry.practical_takeaway.explanation,
    });

    virtues_as_functional_skills.push({
      virtue: entry.virtue,
      skill: entry.functional_skill,
    });

    const resourceKey = entry.resource.author_source;
    if (!seenResources.has(resourceKey)) {
      seenResources.add(resourceKey);
      hard_hitting_resources.push({
        virtue: entry.virtue,
        author_source: entry.resource.author_source,
        why_it_matters: entry.resource.why_it_matters,
      });
    }

    for (const fact of entry.facts) {
      real_world_facts.push(fact);
    }
  }

  if (practical_takeaways.length === 0) return null;

  return { practical_takeaways, virtues_as_functional_skills, hard_hitting_resources, real_world_facts };
}

export default function Learn() {
  const { theme } = useTheme();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasActivities, setHasActivities] = useState(false);

  const getTodayActivities = async () => {
    let activityLogs = [];
    const todayStr = getTodayStr();
    try {
      const u = await base44.auth.me();
      if (u?.email) {
        const progressArr = await base44.entities.DailyProgress.filter({ user_email: u.email, date: todayStr });
        const completedVirtues = progressArr[0]?.completed_virtues || [];
        if (completedVirtues.length > 0) {
          const all = await base44.entities.ActivityLog.filter({ user_email: u.email }, "-created_date", 100);
          const todayPledgeLogs = all.filter(a =>
            a.created_date &&
            format(new Date(a.created_date), "yyyy-MM-dd") === todayStr &&
            a.activity_type === "pledge" &&
            completedVirtues.includes(a.virtue)
          );
          activityLogs = todayPledgeLogs.length > 0
            ? todayPledgeLogs
            : completedVirtues.map(v => ({ virtue: v, activity_type: "pledge", title: "", text: "" }));
        }
      }
    } catch {
      const all = JSON.parse(localStorage.getItem("guest_activities") || "[]");
      activityLogs = all.filter(a => a.created_date && format(new Date(a.created_date), "yyyy-MM-dd") === todayStr);
    }
    return activityLogs;
  };

  const loadContent = async () => {
    setLoading(true);
    const activityLogs = await getTodayActivities();
    if (activityLogs.length === 0) {
      setHasActivities(false);
      setLoading(false);
      return;
    }
    setHasActivities(true);
    const built = buildContentFromPledges(activityLogs);
    setContent(built);
    setLoading(false);
  };

  useEffect(() => { loadContent(); }, []);

  useEffect(() => {
    const handleVisibility = () => { if (!document.hidden) loadContent(); };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const getColor = (virtueName) =>
    (virtueName && (theme.virtueColors[virtueName.toLowerCase()] || VIRTUE_COLORS[virtueName.toLowerCase()])) || theme.accent;

  return (
    <div className="min-h-screen pb-28" style={{ background: theme.bg, color: theme.text }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-2" style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}>
        <div className="w-8" />
        <h1 className="text-xl font-bold tracking-wide" style={{ color: theme.accent, fontFamily: "serif", textShadow: theme.headerGlow ? `0 0 20px ${theme.accent}55` : "none" }}>
          Learn
        </h1>
        <div className="w-8" />
      </div>

      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${theme.accent}30`, borderTopColor: theme.accent }} />
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
                    <div key={i} className="rounded-xl p-4" style={getVirtueCardStyle(theme, color)}>
                      <span className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded inline-block mb-2" style={getPillStyle(theme, color)}>{item.virtue}</span>
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
                    <div key={i} className="flex items-start gap-3 rounded-xl p-3" style={getVirtueCardStyle(theme, color)}>
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
                      <div>
                        <span className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded inline-block mb-1" style={getPillStyle(theme, color)}>{item.virtue}</span>
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
                    <div key={i} className="rounded-xl p-4" style={getVirtueCardStyle(theme, color)}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded" style={getPillStyle(theme, color)}>{item.virtue}</span>
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