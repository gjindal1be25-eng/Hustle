'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { WoodFrame } from '@/components/ui/WoodFrame';
import { StonePanel } from '@/components/ui/StonePanel';
import { RpgTextBox } from '@/components/ui/RpgTextBox';
import { HudBar } from '@/components/ui/HudBar';
import { LESSONS } from '@/lib/constants';

export default function SchoolPage() {
  const { state } = useGame();
  const [activeTab, setActiveTab] = useState<'unlocked' | 'locked'>('unlocked');

  const unlockedLessonIds = new Set(
    state.lessonsSeen.map((l) => l.lessonId)
  );

  const unlockedLessons = LESSONS.filter((l) => unlockedLessonIds.has(l.id));
  const lockedLessons = LESSONS.filter((l) => !unlockedLessonIds.has(l.id));

  const currentLessons = activeTab === 'unlocked' ? unlockedLessons : lockedLessons;

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-[#1B1B1F]">
      <HudBar />

      <div className="w-full max-w-[720px] px-3 sm:px-4 py-4 space-y-4 flex-1">
        <WoodFrame
          title="TOWN SCHOOL OF WISDOM"
          subtitle="8 Foundational financial mental models distilled from classic literature"
        >
          <div className="space-y-4">
            {/* Main Action (top, always visible): Curriculum status & summary */}
            <StonePanel title="Curriculum & Progress">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[20px]">
                <span>
                  Unlocked Scrolls: <strong className="text-[#FFD95A]">{unlockedLessons.length} of 8</strong>
                </span>
                <span className="text-xs text-[#B4BAC4]">
                  Scrolls unlock as you experience real financial milestones in Hustle.
                </span>
              </div>
            </StonePanel>

            {/* Two Tabs: Tab 1: Unlocked, Tab 2: Locked */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('unlocked')}
                className={`px-4 py-2 text-[14px] font-heading cursor-pointer transition-colors ${
                  activeTab === 'unlocked'
                    ? 'bg-[#8B5E34] text-[#FFD95A] border-2 border-[#D9A05E]'
                    : 'bg-[#5C3826] text-[#FFF4D6] border-2 border-[#8B5E34] hover:bg-[#6E442F]'
                }`}
              >
                Unlocked Scrolls ({unlockedLessons.length})
              </button>
              <button
                onClick={() => setActiveTab('locked')}
                className={`px-4 py-2 text-[14px] font-heading cursor-pointer transition-colors ${
                  activeTab === 'locked'
                    ? 'bg-[#8B5E34] text-[#FFD95A] border-2 border-[#D9A05E]'
                    : 'bg-[#5C3826] text-[#FFF4D6] border-2 border-[#8B5E34] hover:bg-[#6E442F]'
                }`}
              >
                Locked Scrolls ({lockedLessons.length})
              </button>
            </div>

            {/* Lesson Cards */}
            <StonePanel title={activeTab === 'unlocked' ? 'Unlocked Wisdom' : 'Locked Scroll Clues'}>
              {currentLessons.length === 0 ? (
                <p className="text-center italic py-4 text-[#B4BAC4]">
                  {activeTab === 'unlocked'
                    ? 'No scrolls unlocked yet. Log your first earnings or goals to unlock your first lesson!'
                    : 'All 8 scrolls have been unlocked! You have mastered the curriculum! 🎓'}
                </p>
              ) : (
                <div className="space-y-3">
                  {currentLessons.map((lesson) => {
                    const isUnlocked = unlockedLessonIds.has(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        className={`p-3.5 border border-[#4B515A] space-y-2 ${
                          isUnlocked ? 'bg-[#2E333B]' : 'bg-[#25282E] opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-[#4B515A]/60 pb-1.5">
                          <div>
                            <span className="text-[12px] font-heading text-[#FFD95A] uppercase block">
                              Scroll #{lesson.id} • Inspired by &ldquo;{lesson.book}&rdquo;
                            </span>
                            <strong className="text-[18px] text-[#FFF4D6] block">
                              {lesson.title}
                            </strong>
                          </div>
                          <span className="text-xl">{isUnlocked ? '📜' : '🔒'}</span>
                        </div>

                        {isUnlocked ? (
                          <div className="p-2.5 bg-[#1B1B1F] border border-[#4B515A]">
                            <p className="text-[20px] text-[#FFF4D6] leading-relaxed">
                              &ldquo;{lesson.cardText}&rdquo;
                            </p>
                          </div>
                        ) : (
                          <div className="p-2 bg-[#1B1B1F] border border-[#4B515A] text-xs text-[#B4BAC4]">
                            <strong className="text-[#FFD95A] block mb-0.5 font-heading">
                              How to unlock:
                            </strong>
                            <p className="text-[16px] text-[#FFF4D6]">{lesson.triggerHint}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </StonePanel>
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
