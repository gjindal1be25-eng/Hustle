'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import { WoodFrame } from '@/components/ui/WoodFrame';
import { StonePanel } from '@/components/ui/StonePanel';
import { PixelButton } from '@/components/ui/PixelButton';
import { CharacterSprite } from '@/components/ui/CharacterSprite';
import { RpgTextBox } from '@/components/ui/RpgTextBox';
import { HudBar } from '@/components/ui/HudBar';
import { calculateGoalProgress, getTodayISO } from '@/lib/rules';
import { LESSONS, LEVEL_THRESHOLDS } from '@/lib/constants';
import { Lesson } from '@/lib/types';

export default function StoryPage() {
  const {
    state,
    level,
    levelTitle,
    savedMonths,
    activeEvent,
    budgetStatuses,
    updateLastSeenLevel,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'overview' | 'lessons'>('overview');
  const [showAllLessons, setShowAllLessons] = useState(false);

  useEffect(() => {
    if (level > (state.meta.lastSeenLevel || 1)) {
      updateLastSeenLevel(level);
    }
  }, [level, state.meta.lastSeenLevel, updateLastSeenLevel]);

  const name = state.profile?.name || 'Hero';
  const today = getTodayISO();

  // Active goal calculation
  const activeGoal = state.goals.find((g) => !g.reachedDate) || state.goals[0];
  const goalProgress = activeGoal
    ? calculateGoalProgress(activeGoal, state.transactions, today)
    : null;

  // Level cushion progress
  const currentThreshold = LEVEL_THRESHOLDS.find((l) => l.level === level) || LEVEL_THRESHOLDS[0];
  const nextThreshold = LEVEL_THRESHOLDS.find((l) => l.level === level + 1);
  const minMonths = Math.max(0, currentThreshold.minSavedMonths);
  const maxMonths = nextThreshold ? nextThreshold.minSavedMonths : minMonths + 1;
  const levelPct = nextThreshold
    ? Math.min(100, Math.max(0, Math.round(((savedMonths - minMonths) / (maxMonths - minMonths)) * 100)))
    : 100;

  // Problem categories for warning strip
  const alertCategories = budgetStatuses.filter((b) => b.status !== 'normal');

  // Lessons list (last 3 items or all)
  const allLessons = LESSONS.map((l: Lesson) => ({
    ...l,
    unlocked: state.lessonsSeen.some((s) => s.lessonId === l.id),
  }));
  const displayedLessons = showAllLessons ? allLessons : allLessons.slice(0, 3);

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-[#1B1B1F]">
      <HudBar />

      <div className="w-full max-w-[720px] px-3 sm:px-4 py-4 space-y-4 flex-1">
        <WoodFrame
          title="HOME & DIARY"
          subtitle="Your daily chronicle, current life events, and story progression"
        >
          {/* Single Calm Stone Panel with Gold Tab Underline */}
          <StonePanel className="space-y-4">
            {/* Tabs with Gold Underline */}
            <div className="flex border-b border-[#4B515A] gap-6 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`pb-1 text-xs sm:text-sm font-heading cursor-pointer transition-colors ${
                  activeTab === 'overview'
                    ? 'text-[#FFD95A] border-b-2 border-[#FFD95A]'
                    : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
                }`}
              >
                Story & Goals
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('lessons')}
                className={`pb-1 text-xs sm:text-sm font-heading cursor-pointer transition-colors ${
                  activeTab === 'lessons'
                    ? 'text-[#FFD95A] border-b-2 border-[#FFD95A]'
                    : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
                }`}
              >
                Lessons ({allLessons.filter((l) => l.unlocked).length} Unlocked)
              </button>
            </div>

            {/* Tab 1: Story Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4 font-sans text-xs sm:text-sm">
                {/* Current Narrative Scene & Why Line */}
                <div className="flex items-start gap-4 pb-3 border-b border-[#4B515A]/60">
                  <div className="flex-shrink-0 flex flex-col items-center p-2 bg-[#1B1B1F] border border-[#4B515A]">
                    <CharacterSprite
                      hairColor={state.profile?.avatar.hairColor}
                      outfitColor={state.profile?.avatar.outfitColor}
                      mood={
                        activeEvent.type === 'debt_spiral'
                          ? 'worried'
                          : activeEvent.type === 'stranded'
                          ? 'sad'
                          : activeEvent.type === 'goal_reached'
                          ? 'celebrating'
                          : 'happy'
                      }
                      size={48}
                      animate={true}
                    />
                    <span className="text-[11px] font-bold text-[#FFD95A] mt-1">{name}</span>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] bg-[#382E25] text-[#FFD95A] px-2 py-0.5 border border-[#54433A] uppercase font-bold">
                        Scene: {activeEvent.scene}
                      </span>
                      <span className="text-[11px] bg-[#2E333B] text-[#FFF4D6] px-2 py-0.5 border border-[#4B515A] uppercase">
                        {activeEvent.type.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-sm sm:text-base text-[#FFF4D6] leading-snug">
                      &ldquo;{activeEvent.eventLine}&rdquo;
                    </p>

                    <div className="p-2 bg-[#2E333B] border-l-2 border-[#FFD95A] text-xs">
                      <span className="text-[#FFD95A] font-bold block uppercase text-[10px]">
                        The Why:
                      </span>
                      <p className="text-[#FFF4D6] opacity-90">{activeEvent.whyLine}</p>
                    </div>

                    {activeEvent.recoveryPlan && (
                      <div className="p-2 bg-[#3A2222] border border-[#EE6A5E] space-y-0.5 text-xs text-[#FFF4D6]">
                        <span className="text-[#EE6A5E] block font-bold uppercase text-[10px]">
                          Recovery Steps:
                        </span>
                        {activeEvent.recoveryPlan.map((step, idx) => (
                          <p key={idx}>▶ {step}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Level Cushion & Active Goal (16px spacing, clean single column) */}
                <div className="space-y-3">
                  {/* Level Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#FFF4D6]">
                        {levelTitle} (Level {level})
                      </span>
                      <span className="text-[#FFD95A] font-bold">{levelPct}% to next rank</span>
                    </div>
                    <div className="w-full h-2 bg-[#1B1B1F] border border-[#4B515A] overflow-hidden">
                      <div className="h-full bg-[#5DB84A] transition-all" style={{ width: `${levelPct}%` }} />
                    </div>
                  </div>

                  {/* Active Goal */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#FFD95A] font-bold">
                        Target: {activeGoal ? activeGoal.name : 'No Active Goal'}
                      </span>
                      {activeGoal && goalProgress && (
                        <span className="text-[#B4BAC4]">
                          ₹{goalProgress.progress.toLocaleString('en-IN')} / ₹{activeGoal.targetAmount.toLocaleString('en-IN')} ({goalProgress.pct}%)
                        </span>
                      )}
                    </div>
                    {activeGoal && goalProgress ? (
                      <div className="w-full h-2 bg-[#1B1B1F] border border-[#4B515A] overflow-hidden">
                        <div className="h-full bg-[#FFD95A] transition-all" style={{ width: `${goalProgress.pct}%` }} />
                      </div>
                    ) : (
                      <Link href="/vault" className="text-xs text-[#D4A373] hover:text-[#FFD95A] underline block">
                        Establish a goal in the Vault ➔
                      </Link>
                    )}
                  </div>

                  {/* Budget Alerts (if any) */}
                  {alertCategories.length > 0 && (
                    <div className="pt-2 border-t border-[#4B515A]/60 space-y-1.5">
                      <span className="text-xs font-bold text-[#EE6A5E] uppercase tracking-wider block">
                        Budget Attention Needed ({alertCategories.length})
                      </span>
                      {alertCategories.map((b) => (
                        <div key={b.category.id} className="flex justify-between text-xs text-[#FFF4D6]">
                          <span>{b.category.name}</span>
                          <span className={b.status === 'danger' ? 'text-[#EE6A5E] font-bold' : 'text-[#FFD95A]'}>
                            {b.status === 'danger' ? 'OVER BUDGET' : 'NEAR LIMIT'} ({(b.pct * 100).toFixed(0)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Exactly One Primary Action Button per screen in solid gold */}
                <div className="pt-2">
                  <Link href="/" className="block">
                    <PixelButton variant="primary" size="md" fullWidth>
                      Return to Town Map
                    </PixelButton>
                  </Link>
                </div>
              </div>
            )}

            {/* Tab 2: Lessons (Last 3 items + See all link) */}
            {activeTab === 'lessons' && (
              <div className="space-y-4 font-sans text-xs sm:text-sm">
                <div className="flex justify-between items-center pb-1 border-b border-[#4B515A]/60">
                  <span className="text-xs sm:text-sm font-sans font-bold text-[#FFD95A] uppercase tracking-wider">
                    Recent Wisdom Scrolls
                  </span>
                  {allLessons.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setShowAllLessons(!showAllLessons)}
                      className="text-xs text-[#D4A373] hover:text-[#FFD95A] underline cursor-pointer"
                    >
                      {showAllLessons ? 'Show latest 3' : `See all (${allLessons.length})`}
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {displayedLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={`p-3 border text-xs sm:text-sm space-y-1 ${
                        lesson.unlocked
                          ? 'border-[#79CE5E] bg-[#2E333B]'
                          : 'border-[#4B515A] bg-[#25282E] opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-[#FFD95A]">
                          {lesson.title} ({lesson.book})
                        </strong>
                        <span className={lesson.unlocked ? 'text-[#79CE5E] font-bold text-[11px]' : 'text-[#B4BAC4] text-[11px]'}>
                          {lesson.unlocked ? 'UNLOCKED' : 'LOCKED'}
                        </span>
                      </div>
                      <p className="text-[#FFF4D6] leading-relaxed">
                        {lesson.cardText}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-center">
                  <Link href="/school" className="text-xs text-[#D4A373] hover:text-[#FFD95A] underline">
                    Visit Schoolhouse for the complete curriculum ➔
                  </Link>
                </div>
              </div>
            )}
          </StonePanel>
        </WoodFrame>

        {/* 96px Bottom RPG Dialogue Text Box */}
        <div className="w-full mt-auto">
          <RpgTextBox />
        </div>
      </div>
    </div>
  );
}
