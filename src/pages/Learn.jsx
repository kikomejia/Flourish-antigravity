import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { generateLearningContent } from "@/functions/generateLearningContent";
import BottomNav from "@/components/BottomNav";
import { BookOpen, Lightbulb, Zap, FlaskConical, RefreshCw } from "lucide-react";
import { VIRTUE_COLORS } from "@/components/VirtueCard";
import { format } from "date-fns";

function getTodayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

function Section({ icon, title, children }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-px" style={{ background: "rgba(243,175,238,0.2)" }} />
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs tracking-widest uppercase font-semibold" style={{ color: "#f3afee" }}>{title}</span>
        </div>
        <div className="flex-1 h-px" style={{ background: "rgba(243,175,238,0.2)" }} />
      </div>
      {children}
    </div>
  );
}

export default function Learn() {
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
        activityLogs = all.filter(a => a.created_date && format(new Date(a.created_date), "yyyy-MM-dd") === getTodayStr());
      }
    } catch {
      const all = JSON.parse(localStorage.getItem("guest_activities") || "[]");
      activityLogs = all.filter(a => a.created_date && format(new Date(a.created_date), "yyyy-MM-dd") === getTodayStr());
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

    // Check cache
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

  useEffect(() => {
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen pb-28" style={{ background: "#050508", color: "white" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="w-8" />
        <h1 className="text-xl font-bold tracking-wide" style={{ color: "#f3afee", fontFamily: "serif", textShadow: "0 0 20px #f3afee55" }}>
          Learn
        </h1>
        <button
          onClick={fetchContent}
          disabled={loading}
          className="w-8 h-8 flex items-center justify-center opacity-50 hover:opacity-80 transition-opacity"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
            <p className="text-xs tracking-widest text-white/30 uppercase">Generating insights...</p>
          </div>
        ) : !hasActivities ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
            <BookOpen size={32} className="opacity-20" />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Complete some virtues today to unlock your learning insights.
            </p>
          </div>
        ) : content ? (
          <>
            {/* Practical Takeaways */}
            <Section icon={<Lightbulb size={13} style={{ color: "#f3afee" }} />} title="Practical Takeaways">
              <div className="space-y-3">
                {content.practical_takeaways?.map((item, i) => {
                  const color = VIRTUE_COLORS[item.virtue?.toLowerCase()] || "#f3afee";
                  return (
                    <div key={i} className="rounded-xl p-4" style={{ background: `${color}0d`, border: `1px solid ${color}33` }}>
                      <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color }}>{item.virtue}</p>
                      <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
                      <p className="text-sm text-white/65 leading-relaxed">{item.explanation}</p>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* Virtues as Functional Skills */}
            <Section icon={<Zap size={13} style={{ color: "#f3afee" }} />} title="Virtues as Functional Skills">
              <div className="space-y-3">
                {content.virtues_as_functional_skills?.map((item, i) => {
                  const color = VIRTUE_COLORS[item.virtue?.toLowerCase()] || "#f3afee";
                  return (
                    <div key={i} className="flex items-start gap-3 rounded-xl p-3" style={{ background: `${color}0d`, border: `1px solid ${color}33` }}>
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                      <div>
                        <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color }}>{item.virtue}</p>
                        <p className="text-sm text-white/70 leading-relaxed">{item.skill}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* Hard-Hitting Resources */}
            <Section icon={<BookOpen size={13} style={{ color: "#f3afee" }} />} title="Hard-Hitting Resources">
              <div className="space-y-3">
                {content.hard_hitting_resources?.map((item, i) => {
                  const color = VIRTUE_COLORS[item.virtue?.toLowerCase()] || "#f3afee";
                  return (
                    <div key={i} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold tracking-widest uppercase" style={{ color }}>{item.virtue}</span>
                        <span className="text-white/20 text-xs">•</span>
                        <span className="text-sm font-semibold text-white/90">{item.author_source}</span>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed">{item.why_it_matters}</p>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* Real-World Facts */}
            <Section icon={<FlaskConical size={13} style={{ color: "#f3afee" }} />} title="Real-World Facts">
              <div className="space-y-3">
                {content.real_world_facts?.map((item, i) => {
                  const [title, ...rest] = item.split(":");
                  return (
                    <div key={i} className="rounded-xl p-4" style={{ background: "rgba(134,239,172,0.05)", border: "1px solid rgba(134,239,172,0.15)" }}>
                      <p className="text-sm text-white/80 leading-relaxed">
                        {rest.length > 0 ? (
                          <><span className="font-bold text-white">{title}:</span>{rest.join(":")}</>
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