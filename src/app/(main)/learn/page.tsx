"use client";

import React, { useState, useEffect } from "react";
import { useTheme, getPillStyle } from "@/lib/ThemeContext";
// Use dynamic import or copy to lib if needed
import PLEDGE_LEARNING_CONTENT from "@/lib/pledgeLearningContent";
import { getDailyItem, VIRTUE_COLORS } from "@/components/VirtueCard";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/lib/AuthContext";
import { DailyProgressService } from "@/lib/services/db";
import { BookOpen, Lightbulb, Zap, FlaskConical } from "lucide-react";
import { format } from "date-fns";

function Section({ icon, title, children, theme }: any) {
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

function buildContentFromPledges(activityLogs: any[]) {
  const practical_takeaways: any[] = [];
  const virtues_as_functional_skills: any[] = [];
  const hard_hitting_resources: any[] = [];
  const real_world_facts: any[] = [];

  const seenResources = new Set();
  
  if (!PLEDGE_LEARNING_CONTENT) return null; // Safety

  for (const act of activityLogs) {
    const entry = (PLEDGE_LEARNING_CONTENT as any)[act.title];
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

export default function LearnPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasActivities, setHasActivities] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      if (user?.email) {
        const todayStr = format(new Date(), "yyyy-MM-dd");
        const progress = await DailyProgressService.getByDate(user.email, todayStr);
        const completedVirtues = progress?.completed_virtues || [];
        
        const acts = completedVirtues.map((v: string) => {
          const item = getDailyItem(v, 0);
          return { virtue: v, title: item?.title || "" };
        });
        
        if (acts.length === 0) {
          if (active) setHasActivities(false);
        } else {
          if (active) {
            setHasActivities(true);
            setContent(buildContentFromPledges(acts));
          }
        }
      } else {
        if (active) setHasActivities(false);
      }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [user]);

  const getColor = (virtueName: string) =>
    (virtueName && (theme.virtueColors[virtueName.toLowerCase()] || VIRTUE_COLORS[virtueName.toLowerCase()])) || theme.accent;

  const cardStyle = (color: string) => 
    theme.cardGlow 
      ? { background: theme.cardBg, border: `1px solid ${color}66`, boxShadow: `0 0 24px ${color}33` }
      : { background: `${color}12`, border: "none" };

  return (
    <div className="min-h-screen pb-28" style={{ background: theme.bg, color: theme.text }}>
      <div className="flex items-center justify-between px-4 pb-2 pt-safe">
        <div className="w-8" />
        <h1 className="text-xl font-bold tracking-wide" style={{ color: theme.accent, fontFamily: "var(--font-recoleta)", textShadow: theme.headerGlow ? `0 0 20px ${theme.accent}55` : "none" }}>
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
            <p className="text-sm px-6" style={{ color: theme.subText }}>
              Complete today's pledges on the Daily screen to unlock your personalized learning insights here.
            </p>
          </div>
        ) : content ? (
          <>
            <Section theme={theme} icon={<Lightbulb size={13} />} title="Practical Takeaways">
              <div className="space-y-3">
                {content.practical_takeaways?.map((item: any, i: number) => {
                  const color = getColor(item.virtue);
                  return (
                    <div key={i} className="rounded-xl p-4" style={cardStyle(color)}>
                      <span className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded inline-block mb-2" style={getPillStyle(theme, color)}>{item.virtue}</span>
                      <p className="text-sm font-semibold mb-1" style={{ color: theme.text }}>{item.title}</p>
                      <p className="text-sm leading-relaxed" style={{ color: theme.subText }}>{item.explanation}</p>
                    </div>
                  );
                })}
              </div>
            </Section>

            <Section theme={theme} icon={<Zap size={13} />} title="Virtues as Functional Skills">
              <div className="space-y-3">
                {content.virtues_as_functional_skills?.map((item: any, i: number) => {
                  const color = getColor(item.virtue);
                  return (
                    <div key={i} className="flex items-start gap-3 rounded-xl p-3" style={cardStyle(color)}>
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

            <Section theme={theme} icon={<BookOpen size={13} />} title="Hard-Hitting Resources">
              <div className="space-y-3">
                {content.hard_hitting_resources?.map((item: any, i: number) => {
                  const color = getColor(item.virtue);
                  return (
                    <div key={i} className="rounded-xl p-4" style={cardStyle(color)}>
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

            <Section theme={theme} icon={<FlaskConical size={13} />} title="Real-World Facts">
              <div className="space-y-3">
                {content.real_world_facts?.map((item: any, i: number) => {
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
