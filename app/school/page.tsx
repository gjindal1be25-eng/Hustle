'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import { WoodFrame } from '@/components/ui/WoodFrame';
import { StonePanel } from '@/components/ui/StonePanel';
import { PixelButton } from '@/components/ui/PixelButton';
import { RpgTextBox } from '@/components/ui/RpgTextBox';
import { HudBar } from '@/components/ui/HudBar';
import { LESSONS } from '@/lib/constants';

export default function SchoolPage() {
  const { state } = useGame();
  const [activeTab, setActiveTab] = useState<'unlocked' | 'locked'>('unlocked');
  const [showAll, setShowAll] = useState(false);

  const unlockedLessonIds = new Set(
    state.lessonsSeen.map((l) => l.lessonId)
  );

  const unlockedLessons = LESSONS.filter((l) => unlockedLessonIds.has(l.id));
  const lockedLessons = LESSONS.filter((l) => !unlockedLessonIds.has(l.id));

  const currentLessons = activeTab === 'unlocked' ? unlockedLessons : lockedLessons;
  const displayedLessons = showAll ? currentLessons : currentLessons.slice(0, 3);

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-[#1B1B1F]">
      <HudBar />

      <div className="w-full max-w-[720px] px-3 sm:px-4 py-4 space-y-4 flex-1">
        <WoodFrame
          title="TOWN SCHOOL OF WISDOM"
          subtitle="8 Foundational financial mental models distilled from classic literature"
        >
          {/* Single Calm Stone Panel with Gold Tab Underline */}
          <StonePanel className="space-y-4">
            {/* Curriculum Progress Strip (16px spacing, clean) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#4B515A]/60 font-sans text-xs sm:text-sm">
              <span className="text-[#FFF4D6]">
                Mastery: <strong className="text-[#FFD95A] font-bold">{unlockedLessons.length} of 8 Scrolls Unlocked</strong>
              </span>
              <span className="text-[#B4BAC4] text-xs">
                Scrolls unlock automatically as you experience real milestones in Hustle.
              </span>
            </div>

            {/* Tabs with Gold Underline */}
            <div className="flex border-b border-[#4B515A] gap-6 pb-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('unlocked');
                  setShowAll(false);
                }}
                className={`pb-1 text-xs sm:text-sm font-heading cursor-pointer transition-colors ${
                  activeTab === 'unlocked'
                    ? 'text-[#FFD95A] border-b-2 border-[#FFD95A]'
                    : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
                }`}
              >
                Unlocked Scrolls ({unlockedLessons.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('locked');
                  setShowAll(false);
                }}
                className={`pb-1 text-xs sm:text-sm font-heading cursor-pointer transition-colors ${
                  activeTab === 'locked'
                    ? 'text-[#FFD95A] border-b-2 border-[#FFD95A]'
                    : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
                }`}
              >
                Locked Clues ({lockedLessons.length})
              </button>
            </div>

            {/* Lesson Cards (Last 3 items + See all link) */}
            <div className="space-y-3 font-sans text-xs sm:text-sm">
              <div className="flex justify-between items-center pb-1">
                <span className="text-xs text-[#B4BAC4] uppercase tracking-wider">
                  {activeTab === 'unlocked' ? 'Unlocked Wisdom' : 'Clues to Discover'}
                </span>
                {currentLessons.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAll(!showAll)}
                    className="text-xs text-[#D4A373] hover:text-[#FFD95A] underline cursor-pointer"
                  >
                    {showAll ? 'Show latest 3' : `See all (${currentLessons.length})`}
                  </button>
                )}
              </div>

              {currentLessons.length === 0 ? (
                <p className="text-center italic py-4 text-xs text-[#B4BAC4]">
                  {activeTab === 'unlocked'
                    ? 'No scrolls unlocked yet. Log your first earnings or goals to unlock a scroll!'
                    : 'All 8 scrolls have been unlocked! You have mastered the town curriculum! 🎓'}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {displayedLessons.map((lesson) => {
                    const isUnlocked = unlockedLessonIds.has(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        className={`p-3 border space-y-1.5 ${
                          isUnlocked ? 'border-[#4B515A] bg-[#2E333B]' : 'border-[#4B515A]/60 bg-[#25282E] opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[11px] text-[#FFD95A] font-bold uppercase block">
                              Scroll #{lesson.id} · {lesson.book}
                            </span>
                            <strong className="text-xs sm:text-sm text-[#FFF4D6]">
                              {lesson.title}
                            </strong>
                          </div>
                          <span className="text-base">{isUnlocked ? '📜' : '🔒'}</span>
                        </div>

                        {isUnlocked ? (
                          <p className="text-xs sm:text-sm text-[#FFF4D6] opacity-90 leading-relaxed">
                            &ldquo;{lesson.cardText}&rdquo;
                          </p>
                        ) : (
                          <div className="text-xs text-[#B4BAC4]">
                            <strong className="text-[#FFD95A] block mb-0.5">How to unlock:</strong>
                            <p>{lesson.triggerHint}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Exactly One Primary Action Button per screen in solid gold */}
              <div className="pt-2">
                <Link href="/" className="block">
                  <PixelButton variant="primary" size="md" fullWidth>
                    Return to Town Map
                  </PixelButton>
                </Link>
              </div>
            </div>
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
