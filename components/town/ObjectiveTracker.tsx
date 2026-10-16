'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import { QUEST_CHAPTERS, QuestStep } from '@/lib/quests';
import { WoodFrame } from '@/components/ui/WoodFrame';
import { StonePanel } from '@/components/ui/StonePanel';
import { PixelButton } from '@/components/ui/PixelButton';
import { playButtonSound } from '@/lib/sound';

interface ObjectiveTrackerProps {
  onWalkToBuilding?: (buildingId: string) => void;
  className?: string;
}

export function ObjectiveTracker({
  onWalkToBuilding,
  className = '',
}: ObjectiveTrackerProps) {
  const { questProgress, viewMode, setViewMode } = useGame();
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If in Pure Financial View, render a minimal financial vitals pill instead
  if (viewMode === 'finance') {
    return (
      <div className={`w-full max-w-[850px] mx-auto select-none ${className}`}>
        <div className="bg-[#121316]/95 border-2 border-[#4B515A] px-3 py-1.5 flex items-center justify-between text-xs text-[#FFF4D6] shadow-[0_3px_0_#000]">
          <div className="flex items-center gap-2">
            <span className="text-sm">📊</span>
            <span className="font-heading text-[#FFD95A] text-[10px] sm:text-xs">
              PURE FINANCIAL MODE
            </span>
            <span className="text-[#B4BAC4] text-[11px] hidden sm:inline">
              · Direct Ledger & Calculator View
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              playButtonSound();
              setViewMode('quest');
            }}
            className="text-[11px] font-heading text-[#FFD95A] hover:underline cursor-pointer flex items-center gap-1 px-2 py-0.5 border border-[#FFD95A]/40 bg-[#FFD95A]/10"
          >
            <span>Switch to Quest View</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    );
  }

  const { currentChapter, currentStep, isAllCompleted, activeBuildingId, activeRoute } =
    questProgress;

  const handleAction = () => {
    playButtonSound();
    if (activeBuildingId && onWalkToBuilding) {
      onWalkToBuilding(activeBuildingId);
    }
  };

  return (
    <>
      <div
        className={`w-full max-w-[850px] mx-auto select-none transition-all ${className}`}
      >
        {isCollapsed ? (
          /* Collapsed Pill */
          <div className="bg-[#1B1B1F]/90 border border-[#B79A60] px-3 py-1 flex items-center justify-between shadow-[0_2px_0_#000]">
            <div className="flex items-center gap-2">
              <span className="text-xs animate-pulse">🎯</span>
              <span className="font-heading text-[10px] text-[#FFD95A]">
                {isAllCompleted
                  ? 'ALL CHAPTERS COMPLETE'
                  : `${currentChapter.title}: ${currentStep?.title || 'Next Step'}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="text-[10px] font-heading text-[#B4BAC4] hover:text-[#FFF4D6] underline cursor-pointer"
              >
                Expand
              </button>
            </div>
          </div>
        ) : (
          /* Full Active Objective Banner */
          <div className="bg-[#1B1B1F]/95 border-2 border-[#B79A60] p-2.5 sm:p-3 shadow-[0_4px_0_#000] relative">
            {/* Top Row: Mission Chapter badge, Step Count, and Collapse / Roadmap buttons */}
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#4B515A]/60 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base animate-bounce">🎯</span>
                <span className="font-heading text-[10px] sm:text-xs text-[#FFD95A] uppercase tracking-wider">
                  {isAllCompleted ? 'FINANCIAL INDEPENDENCE MASTERED' : currentChapter.title}
                </span>
                {!isAllCompleted && currentStep && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#FFD95A]/15 text-[#FFD95A] border border-[#FFD95A]/40 font-bold">
                    Step {currentStep.stepNumber} of {currentChapter.steps.length}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playButtonSound();
                    setShowRoadmap(true);
                  }}
                  className="text-[10px] sm:text-[11px] font-heading px-2 py-0.5 bg-[#23252B] hover:bg-[#FFD95A] hover:text-[#1B1B1F] text-[#FFF4D6] border border-[#4B515A] hover:border-[#FFD95A] cursor-pointer transition-colors shadow-xs flex items-center gap-1"
                  title="View full 5-chapter roadmap"
                >
                  <span>📜</span>
                  <span>ROADMAP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  className="text-xs text-[#B4BAC4] hover:text-[#FFF4D6] px-1 cursor-pointer"
                  title="Collapse objective bar"
                >
                  ▲
                </button>
              </div>
            </div>

            {/* Main Action Content Row */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-heading text-xs sm:text-sm text-[#FFF4D6] truncate">
                    {isAllCompleted
                      ? '🏆 You Have Achieved Financial Independence!'
                      : currentStep?.title}
                  </h4>
                  {!isAllCompleted && currentStep && (
                    <span className="text-[10px] text-[#79CE5E] font-bold font-mono">
                      +{currentStep.rewardRenown} ⭐
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-[#B4BAC4] leading-relaxed line-clamp-2">
                  {isAllCompleted
                    ? 'Congratulations! You have built a 6+ month emergency cushion and zero toxic liabilities.'
                    : currentStep?.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                {!isAllCompleted && currentStep && (
                  <>
                    {activeBuildingId && onWalkToBuilding ? (
                      <button
                        type="button"
                        onClick={handleAction}
                        className="px-3 py-1.5 bg-[#FFD95A] hover:bg-[#FFE382] text-[#1B1B1F] border-2 border-[#1B1B1F] font-heading text-[10px] sm:text-xs shadow-[0_2px_0_#000] cursor-pointer font-bold flex items-center gap-1.5 transition-transform active:translate-y-0.5"
                      >
                        <span>🚶</span>
                        <span>WALK THERE</span>
                        <span>➔</span>
                      </button>
                    ) : activeRoute ? (
                      <Link href={activeRoute}>
                        <button
                          type="button"
                          className="px-3 py-1.5 bg-[#FFD95A] hover:bg-[#FFE382] text-[#1B1B1F] border-2 border-[#1B1B1F] font-heading text-[10px] sm:text-xs shadow-[0_2px_0_#000] cursor-pointer font-bold flex items-center gap-1.5 transition-transform active:translate-y-0.5"
                        >
                          <span>{currentStep.actionLabel}</span>
                          <span>➔</span>
                        </button>
                      </Link>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full 5-Chapter Financial Roadmap Modal */}
      {showRoadmap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <WoodFrame
              title="FINANCIAL LIFE ROADMAP"
              subtitle="From Broke Novice to Wealth Champion: Real Domestic Milestones"
              showBackToTown={false}
            >
              <StonePanel className="space-y-4 relative">
                <button
                  type="button"
                  onClick={() => setShowRoadmap(false)}
                  className="absolute top-2 right-2 text-[#B4BAC4] hover:text-[#FFF4D6] text-xs px-2 py-0.5 rounded border border-[#4B515A] cursor-pointer bg-[#1B1B1F] z-10"
                  title="Close"
                >
                  ✕
                </button>

                {/* Progress Summary Header */}
                <div className="p-3 bg-[#23252B] border border-[#B79A60] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#FFD95A] tracking-wider block">
                      ROADMAP PROGRESS
                    </span>
                    <h3 className="text-sm sm:text-base font-heading text-[#FFF4D6]">
                      {questProgress.chapterCompletedCount} of {questProgress.totalChapters} Chapters Completed
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#B4BAC4]">View Mode:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('finance');
                        setShowRoadmap(false);
                      }}
                      className="px-2 py-1 bg-[#1B1B1F] border border-[#4B515A] hover:border-[#FFD95A] text-[10px] font-heading text-[#FFF4D6] cursor-pointer"
                    >
                      📊 Pure Financial Mode
                    </button>
                  </div>
                </div>

                {/* 5 Chapters Accordion / List */}
                <div className="space-y-3">
                  {QUEST_CHAPTERS.map((ch) => {
                    const isChapterActive = currentChapter.id === ch.id && !isAllCompleted;
                    const isChapterDone = ch.steps.every((s) => questProgress.completedStepIds.includes(s.id));

                    return (
                      <div
                        key={ch.id}
                        className={`p-3.5 border-2 transition-all ${
                          isChapterActive
                            ? 'bg-[#23252B] border-[#FFD95A] shadow-[0_3px_0_#000]'
                            : isChapterDone
                            ? 'bg-[#1E2320] border-[#2A9D8F]/60'
                            : 'bg-[#1B1B1F] border-[#4B515A]/60 opacity-80'
                        }`}
                      >
                        {/* Chapter Header */}
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#4B515A]/40 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {isChapterDone ? '✅' : isChapterActive ? '⚡' : '🔒'}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-heading text-xs sm:text-sm text-[#FFD95A]">
                                  {ch.title}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1B1B1F] text-[#B4BAC4] border border-[#4B515A]">
                                  {ch.rankTitle}
                                </span>
                              </div>
                              <span className="text-[11px] text-[#B4BAC4]">{ch.subtitle}</span>
                            </div>
                          </div>

                          <span className="text-[11px] font-bold text-[#79CE5E] font-mono">
                            +{ch.rewardRenown} ⭐ Total
                          </span>
                        </div>

                        {/* Chapter 3 Steps */}
                        <div className="pt-2.5 space-y-2">
                          {ch.steps.map((step) => {
                            const isStepDone = questProgress.completedStepIds.includes(step.id);
                            const isStepCurrent = currentStep?.id === step.id;

                            return (
                              <div
                                key={step.id}
                                className={`p-2.5 border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                                  isStepCurrent
                                    ? 'bg-[#2E333B] border-[#FFD95A]'
                                    : isStepDone
                                    ? 'bg-[#1B1B1F]/60 border-[#2A9D8F]/40'
                                    : 'bg-[#1B1B1F]/30 border-[#4B515A]/30'
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold">
                                      {isStepDone ? '✓' : isStepCurrent ? '▶' : '○'}
                                    </span>
                                    <span
                                      className={`font-bold ${
                                        isStepDone
                                          ? 'text-[#79CE5E] line-through'
                                          : isStepCurrent
                                          ? 'text-[#FFD95A]'
                                          : 'text-[#B4BAC4]'
                                      }`}
                                    >
                                      Step {step.stepNumber}: {step.title}
                                    </span>
                                    <span className="text-[10px] font-mono text-[#D4A373]">
                                      +{step.rewardRenown} ⭐
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#FFF4D6] pl-4">
                                    {step.description}
                                  </p>
                                  <p className="text-[10px] text-[#8E929A] pl-4 italic">
                                    💡 {step.financialRationale}
                                  </p>
                                </div>

                                <div className="pl-4 sm:pl-0 shrink-0">
                                  {isStepDone ? (
                                    <span className="text-[11px] text-[#79CE5E] font-bold">
                                      COMPLETED
                                    </span>
                                  ) : isStepCurrent ? (
                                    <Link
                                      href={step.targetRoute}
                                      onClick={() => setShowRoadmap(false)}
                                    >
                                      <PixelButton variant="primary" size="sm">
                                        {step.actionLabel} ➔
                                      </PixelButton>
                                    </Link>
                                  ) : (
                                    <span className="text-[10px] text-[#8E929A]">Upcoming</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <PixelButton
                    variant="wood"
                    size="sm"
                    onClick={() => setShowRoadmap(false)}
                  >
                    CLOSE ROADMAP
                  </PixelButton>
                </div>
              </StonePanel>
            </WoodFrame>
          </div>
        </div>
      )}
    </>
  );
}
