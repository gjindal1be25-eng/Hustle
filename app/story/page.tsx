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
import { AVATAR_PRESETS, LEVEL_THRESHOLDS } from '@/lib/constants';
import { getTodayISO, calculateGoalProgress } from '@/lib/rules';

export default function StoryPage() {
  const {
    state,
    level,
    levelTitle,
    savedMonths,
    activeEvent,
    budgetStatuses,
    streak,
    updateProfile,
    updateLastSeenLevel,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'diary' | 'wardrobe'>('diary');

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

  const hair = state.profile?.avatar.hairColor || AVATAR_PRESETS.hairColors[0].value;
  const outfit = state.profile?.avatar.outfitColor || AVATAR_PRESETS.outfitColors[0].value;

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-[#1B1B1F]">
      <HudBar />

      <div className="w-full max-w-[720px] px-3 sm:px-4 py-4 space-y-4 flex-1">
        <WoodFrame
          title="HOME & PERSONAL DIARY"
          subtitle="Your personal chronicle, emotional state, recovery plans, and character wardrobe"
        >
          {/* Single Calm Stone Panel with Gold Tab Underline */}
          <StonePanel className="space-y-4">
            {/* Tabs with Gold Underline */}
            <div className="flex border-b border-[#4B515A] gap-6 pb-2 text-xs sm:text-sm font-heading">
              <button
                type="button"
                onClick={() => setActiveTab('diary')}
                className={`pb-1 cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activeTab === 'diary'
                    ? 'text-[#FFD95A] border-b-2 border-[#FFD95A] font-bold'
                    : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
                }`}
              >
                <span>📖</span>
                <span>Personal Diary & Life</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('wardrobe')}
                className={`pb-1 cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activeTab === 'wardrobe'
                    ? 'text-[#FFD95A] border-b-2 border-[#FFD95A] font-bold'
                    : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
                }`}
              >
                <span>🪞</span>
                <span>Wardrobe & Mirror</span>
              </button>
            </div>

            {/* Tab 1: Personal Diary & Life Narrative */}
            {activeTab === 'diary' && (
              <div className="space-y-4 font-sans text-xs sm:text-sm">
                {/* Current Narrative Scene & Mood */}
                <div className="flex items-start gap-4 pb-3 border-b border-[#4B515A]/60">
                  <div className="flex-shrink-0 flex flex-col items-center p-2 bg-[#1B1B1F] border border-[#4B515A]">
                    <CharacterSprite
                      hairColor={hair}
                      outfitColor={outfit}
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] bg-[#382E25] text-[#FFD95A] px-2 py-0.5 border border-[#54433A] uppercase font-bold">
                        Scene: {activeEvent.scene}
                      </span>
                      <span className="text-[11px] bg-[#2E333B] text-[#FFF4D6] px-2 py-0.5 border border-[#4B515A] uppercase">
                        {activeEvent.type.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] bg-[#2A9D8F]/20 text-[#2A9D8F] px-2 py-0.5 border border-[#2A9D8F]/40 font-mono font-bold">
                        🔥 {streak}-Day Logging Streak
                      </span>
                    </div>

                    <p className="text-sm sm:text-base text-[#FFF4D6] leading-snug italic">
                      &ldquo;{activeEvent.eventLine}&rdquo;
                    </p>

                    <div className="p-2 bg-[#2E333B] border-l-2 border-[#FFD95A] text-xs">
                      <span className="text-[#FFD95A] font-bold block uppercase text-[10px]">
                        Diary Chronicle:
                      </span>
                      <p className="text-[#FFF4D6]">{activeEvent.whyLine}</p>
                    </div>

                    {/* Recovery Action Plan (if in difficulty) */}
                    {activeEvent.recoveryPlan && activeEvent.recoveryPlan.length > 0 && (
                      <div className="p-2.5 bg-[#3A2222] border border-[#EE6A5E] text-xs text-[#FFF4D6] space-y-1">
                        <span className="font-heading text-[#EE6A5E] block text-[10px] uppercase">
                          Action Recovery Plan:
                        </span>
                        {activeEvent.recoveryPlan.map((step, idx) => (
                          <p key={idx}>▶ {step}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Level Cushion & Active Target */}
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

                  {/* Active Goal Quick View */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#FFD95A] font-bold">
                        Current Savings Target: {activeGoal ? activeGoal.name : 'No Active Goal'}
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
                        Establish a savings goal in the Town Vault ➔
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

                {/* Wisdom Cross-Link */}
                <div className="p-3 bg-[#1B1B1F] rounded border border-[#B79A60] flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📜</span>
                    <span className="text-[#FFF4D6]">Looking for financial literature & scrolls?</span>
                  </div>
                  <Link
                    href="/school"
                    className="text-[#FFD95A] hover:underline font-heading text-[11px]"
                  >
                    Visit School of Wisdom ➔
                  </Link>
                </div>

                <div className="pt-2">
                  <Link href="/" className="block">
                    <PixelButton variant="primary" size="md" fullWidth>
                      Return to Town Map
                    </PixelButton>
                  </Link>
                </div>
              </div>
            )}

            {/* Tab 2: Wardrobe & Mirror (Living Room Dresser) */}
            {activeTab === 'wardrobe' && (
              <div className="space-y-4 font-sans text-xs sm:text-sm">
                <div className="flex items-center gap-5 p-3 bg-[#1B1B1F] rounded border border-[#4B515A]">
                  <div className="p-3 bg-[#23252B] border border-[#B79A60] flex flex-col items-center justify-center shrink-0">
                    <CharacterSprite
                      hairColor={hair}
                      outfitColor={outfit}
                      mood="happy"
                      size={64}
                      animate={true}
                    />
                    <span className="text-[10px] text-[#FFD95A] font-heading mt-1">Mirror View</span>
                  </div>

                  <div className="space-y-3 flex-1 text-xs">
                    {/* Hair Tone Picker */}
                    <div>
                      <span className="text-[#B4BAC4] font-bold block mb-1">Hair Tone</span>
                      <div className="flex flex-wrap gap-2">
                        {AVATAR_PRESETS.hairColors.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() =>
                              updateProfile({
                                avatar: { hairColor: c.value, outfitColor: outfit },
                              })
                            }
                            className={`w-6 h-6 border cursor-pointer transition-transform ${
                              hair === c.value ? 'border-[#FFD95A] scale-110 shadow' : 'border-[#1B1B1F]'
                            }`}
                            style={{ backgroundColor: c.value }}
                            title={c.label}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Outfit Tone Picker */}
                    <div>
                      <span className="text-[#B4BAC4] font-bold block mb-1">Outfit Tone</span>
                      <div className="flex flex-wrap gap-2">
                        {AVATAR_PRESETS.outfitColors.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() =>
                              updateProfile({
                                avatar: { hairColor: hair, outfitColor: c.value },
                              })
                            }
                            className={`w-6 h-6 border cursor-pointer transition-transform ${
                              outfit === c.value ? 'border-[#FFD95A] scale-110 shadow' : 'border-[#1B1B1F]'
                            }`}
                            style={{ backgroundColor: c.value }}
                            title={c.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#B4BAC4] italic">
                  Changes to your wardrobe reflect instantly on your character sprite walking across the island!
                </p>

                <div className="pt-2">
                  <Link href="/" className="block">
                    <PixelButton variant="primary" size="md" fullWidth>
                      Done Dressing & Step Outside
                    </PixelButton>
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
