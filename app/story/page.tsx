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

  // Level progress calculation based on saved months cushion
  const currentThreshold = LEVEL_THRESHOLDS.find((l) => l.level === level) || LEVEL_THRESHOLDS[0];
  const nextThreshold = LEVEL_THRESHOLDS.find((l) => l.level === level + 1);
  const minMonths = Math.max(0, currentThreshold.minSavedMonths);
  const maxMonths = nextThreshold ? nextThreshold.minSavedMonths : minMonths + 1;
  const levelPct = nextThreshold
    ? Math.min(100, Math.max(0, Math.round(((savedMonths - minMonths) / (maxMonths - minMonths)) * 100)))
    : 100;

  // Problem categories for warning strip
  const alertCategories = budgetStatuses.filter((b) => b.status !== 'normal');

  // Lessons list
  const allLessons = LESSONS.map((l: Lesson) => ({
    ...l,
    unlocked: state.lessonsSeen.some((s) => s.lessonId === l.id),
  }));
  const displayedLessons = showAllLessons ? allLessons : allLessons.slice(0, 5);

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-[#1B1B1F]">
      <HudBar />

      <div className="w-full max-w-[720px] px-3 sm:px-6 py-6 space-y-4 flex-1">
        <WoodFrame
          title="HOME & DIARY"
          subtitle="Your daily story chronicle, current standing, and life events"
        >
          <div className="space-y-4">
            {/* Main Action (top, always visible): Latest Event & Why Line */}
            <StonePanel>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Character In Scene */}
                <div className="flex flex-col items-center justify-center p-3 bg-[#1B1B1F] border border-[#4B515A] min-w-[110px]">
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
                    size={64}
                    animate={true}
                  />
                  <span className="font-['VT323'] text-[20px] text-[#FFD95A] mt-1">
                    {name}
                  </span>
                  <span className="font-['VT323'] text-[16px] text-[#FFF4D6]/70">
                    {levelTitle} (L{level})
                  </span>
                </div>

                {/* Event Narrative Card */}
                <div className="flex-1 space-y-2 font-['VT323'] text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] bg-[#382E25] text-[#FFD95A] px-2 py-0.5 border border-[#54433A] uppercase">
                      Scene: {activeEvent.scene}
                    </span>
                    <span className="text-[16px] bg-[#2E333B] text-[#FFF4D6] px-2 py-0.5 border border-[#4B515A] uppercase">
                      {activeEvent.type.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-[22px] text-[#FFF4D6] leading-tight">
                    &ldquo;{activeEvent.eventLine}&rdquo;
                  </p>

                  <div className="p-2.5 bg-[#2E333B] border-l-4 border-[#FFD95A]">
                    <span className="text-[18px] text-[#FFD95A] uppercase block">
                      The &ldquo;Why&rdquo; Behind This:
                    </span>
                    <p className="text-[20px] text-[#FFF4D6]">
                      {activeEvent.whyLine}
                    </p>
                  </div>

                  {activeEvent.recoveryPlan && (
                    <div className="p-2 bg-[#3A2222] border border-[#EE6A5E] space-y-1">
                      <span className="text-[18px] text-[#EE6A5E] block uppercase">
                        Recommended Recovery Steps:
                      </span>
                      {activeEvent.recoveryPlan.map((step, idx) => (
                        <p key={idx} className="text-[16px] text-[#FFF4D6]">
                          ▶ {step}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </StonePanel>

            {/* Two Tabs: Overview & Lessons */}
            <div className="flex border-b-2 border-[#4B515A] gap-2 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 font-['Press_Start_2P'] text-[14px] cursor-pointer transition-colors border-2 ${
                  activeTab === 'overview'
                    ? 'bg-[#382E25] text-[#FFD95A] border-[#FFD95A]'
                    : 'bg-[#2A231D] text-[#FFF4D6] border-[#54433A] hover:bg-[#382E25]'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('lessons')}
                className={`px-4 py-2 font-['Press_Start_2P'] text-[14px] cursor-pointer transition-colors border-2 ${
                  activeTab === 'lessons'
                    ? 'bg-[#382E25] text-[#FFD95A] border-[#FFD95A]'
                    : 'bg-[#2A231D] text-[#FFF4D6] border-[#54433A] hover:bg-[#382E25]'
                }`}
              >
                Lessons
              </button>
            </div>

            {/* Tab 1: Overview (level bar, goal bar, budget alerts) */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Level Progress Bar */}
                <StonePanel>
                  <div className="space-y-2 font-['VT323']">
                    <div className="flex justify-between items-center text-[20px]">
                      <span className="text-[#FFF4D6]">
                        Town Level {level}: {levelTitle}
                      </span>
                      <span className="text-[#FFD95A]">{levelPct}% to next level</span>
                    </div>

                    <div className="w-full h-4 bg-[#1B1B1F] border border-[#4B515A] overflow-hidden">
                      <div
                        className="h-full bg-[#79CE5E] transition-all"
                        style={{ width: `${levelPct}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[16px] text-[#FFF4D6]/70">
                      <span>Savings Cushion: {savedMonths} mos</span>
                      <span>
                        {nextThreshold
                          ? `Next Tier: ${nextThreshold.minSavedMonths} mos cushion`
                          : 'Max Tier Achieved'}
                      </span>
                    </div>
                  </div>
                </StonePanel>

                {/* Active Goal Progress Bar */}
                <StonePanel>
                  <div className="space-y-2 font-['VT323']">
                    <span className="text-[20px] text-[#FFD95A] block">
                      Active Savings Goal: {activeGoal ? activeGoal.name : 'No Active Goal'}
                    </span>

                    {activeGoal && goalProgress ? (
                      <>
                        <div className="flex justify-between text-[18px]">
                          <span className="text-[#FFF4D6]">
                            Progress: ₹{goalProgress.progress.toLocaleString('en-IN')} / ₹{activeGoal.targetAmount.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[#FFD95A]">{goalProgress.pct}%</span>
                        </div>

                        <div className="w-full h-4 bg-[#1B1B1F] border border-[#4B515A] overflow-hidden">
                          <div
                            className="h-full bg-[#FFD95A] transition-all"
                            style={{ width: `${goalProgress.pct}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[16px] text-[#FFF4D6]/70">
                          <span>Started on: {activeGoal.createdDate}</span>
                          <span>Target: ₹{activeGoal.targetAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-[18px] text-[#FFF4D6]/70 italic">
                        Visit the Vault to establish a new savings goal.
                      </p>
                    )}
                  </div>
                </StonePanel>

                {/* Budget Alerts */}
                <StonePanel>
                  <span className="font-['VT323'] text-[20px] text-[#FFD95A] block mb-2">
                    Budget Alerts & Monitoring
                  </span>
                  {alertCategories.length === 0 ? (
                    <p className="font-['VT323'] text-[18px] text-[#79CE5E]">
                      All categories are safely within their monthly limits.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {alertCategories.map((b) => (
                        <div
                          key={b.category.id}
                          className="p-2.5 bg-[#2E333B] border border-[#4B515A] space-y-1 font-['VT323']"
                        >
                          <div className="flex justify-between text-[18px]">
                            <span className="text-[#FFF4D6]">{b.category.name}</span>
                            <span className={b.status === 'danger' ? 'text-[#EE6A5E]' : 'text-[#FFD95A]'}>
                              {b.status === 'danger' ? 'OVER BUDGET' : 'NEAR LIMIT'} ({(b.pct * 100).toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-[#1B1B1F] border border-[#4B515A] overflow-hidden">
                            <div
                              className={`h-full ${b.status === 'danger' ? 'bg-[#EE6A5E]' : 'bg-[#FFD95A]'}`}
                              style={{ width: `${Math.min(100, b.pct * 100)}%` }}
                            />
                          </div>
                          <span className="text-[16px] text-[#FFF4D6]/70 block">
                            Spent ₹{b.spent.toLocaleString('en-IN')} of ₹{(b.category.monthlyLimit || 0).toLocaleString('en-IN')} limit.
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </StonePanel>

                {/* Primary Button: Return to Town Map */}
                <div className="pt-2 flex justify-center">
                  <Link href="/">
                    <PixelButton variant="primary">
                      Return to Town Map
                    </PixelButton>
                  </Link>
                </div>
              </div>
            )}

            {/* Tab 2: Lessons (recent lesson cards) */}
            {activeTab === 'lessons' && (
              <div className="space-y-4">
                <StonePanel>
                  <span className="font-['VT323'] text-[20px] text-[#FFD95A] block mb-2">
                    Recent Financial Lessons
                  </span>

                  {allLessons.length === 0 ? (
                    <p className="font-['VT323'] text-[18px] text-[#FFF4D6]/70 italic">
                      No lessons logged yet. Visit the Schoolhouse to explore lessons!
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {displayedLessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className={`p-3 border-2 font-['VT323'] space-y-1 ${
                            lesson.unlocked
                              ? 'border-[#79CE5E] bg-[#2E333B]'
                              : 'border-[#4B515A] bg-[#25282E]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[20px] text-[#FFD95A]">
                              {lesson.title} ({lesson.book})
                            </span>
                            <span className={`text-[16px] ${lesson.unlocked ? 'text-[#79CE5E]' : 'text-[#FFF4D6]/70'}`}>
                              {lesson.unlocked ? 'UNLOCKED' : 'LOCKED'}
                            </span>
                          </div>
                          <p className="text-[18px] text-[#FFF4D6]/90">
                            {lesson.cardText}
                          </p>
                        </div>
                      ))}

                      {allLessons.length > 5 && (
                        <div className="pt-2 text-center">
                          <button
                            type="button"
                            onClick={() => setShowAllLessons(!showAllLessons)}
                            className="font-['VT323'] text-[18px] text-[#FFD95A] underline hover:text-[#FFE885] cursor-pointer"
                          >
                            {showAllLessons ? 'Show less' : `Show all (${allLessons.length} lessons)`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </StonePanel>

                {/* Primary Button: Visit School */}
                <div className="pt-2 flex justify-center">
                  <Link href="/school">
                    <PixelButton variant="primary">
                      Visit Schoolhouse
                    </PixelButton>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </WoodFrame>

        {/* 96px Bottom RPG Dialogue Text Box */}
        <div className="w-full mt-auto">
          <RpgTextBox />
        </div>
      </div>
    </div>
  );
}
