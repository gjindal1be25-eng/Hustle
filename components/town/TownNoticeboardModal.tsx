'use client';

import React from 'react';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import { WoodFrame } from '@/components/ui/WoodFrame';
import { StonePanel } from '@/components/ui/StonePanel';
import { PixelButton } from '@/components/ui/PixelButton';

interface TownNoticeboardModalProps {
  onClose: () => void;
}

export function TownNoticeboardModal({ onClose }: TownNoticeboardModalProps) {
  const { dailyHabits } = useGame();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-fadeIn select-none">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <WoodFrame
          title="TOWN NOTICEBOARD"
          subtitle="Daily Village Routine & Financial Consistency Habits"
          showBackToTown={false}
        >
          <StonePanel className="space-y-4 relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-2 right-2 text-[#B4BAC4] hover:text-[#FFF4D6] text-xs px-2 py-0.5 rounded border border-[#4B515A] cursor-pointer bg-[#1B1B1F] z-10"
              title="Close"
            >
              ✕
            </button>

            {/* Daily Routine Header */}
            <div className="p-3 bg-[#23252B] border border-[#B79A60] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">📋</span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#FFD95A] tracking-wider block">
                    TODAY&apos;S ROUTINE
                  </span>
                  <h3 className="text-xs sm:text-sm font-heading text-[#FFF4D6]">
                    {dailyHabits.completedCount} of {dailyHabits.totalCount} Habits Checked Off
                  </h3>
                </div>
              </div>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 font-bold border ${
                  dailyHabits.allCompleted
                    ? 'bg-[#2A9D8F]/20 text-[#2A9D8F] border-[#2A9D8F]'
                    : 'bg-[#FFD95A]/20 text-[#FFD95A] border-[#FFD95A]'
                }`}
              >
                {dailyHabits.allCompleted ? '✓ ALL DONE' : 'IN PROGRESS'}
              </span>
            </div>

            {/* 4 Daily Habits List */}
            <div className="space-y-2.5">
              {dailyHabits.habits.map(({ habit, completed }) => (
                <div
                  key={habit.id}
                  className={`p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
                    completed
                      ? 'bg-[#1E2320] border-[#2A9D8F]/60'
                      : 'bg-[#23252B] border-[#4B515A] hover:border-[#B79A60]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl shrink-0 mt-0.5">{habit.icon}</span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-heading text-xs ${
                            completed ? 'text-[#79CE5E] line-through' : 'text-[#FFD95A]'
                          }`}
                        >
                          {habit.title}
                        </span>
                        <span className="text-[10px] font-mono text-[#D4A373]">
                          +{habit.rewardRenown} ⭐
                        </span>
                      </div>
                      <p className="text-[11px] text-[#B4BAC4] leading-relaxed">
                        {habit.desc}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    {completed ? (
                      <span className="text-[11px] font-bold text-[#79CE5E] flex items-center gap-1 font-mono">
                        <span>✓</span>
                        <span>DONE</span>
                      </span>
                    ) : (
                      <Link href={habit.targetRoute} onClick={onClose}>
                        <PixelButton variant="primary" size="sm">
                          {habit.actionLabel} ➔
                        </PixelButton>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Consistency Pro-Tip */}
            <div className="p-2.5 bg-[#1B1B1F] border border-[#4B515A] text-xs text-[#FFF4D6] flex items-start gap-2">
              <span className="text-base shrink-0">💡</span>
              <p className="text-[11px] text-[#B4BAC4] leading-relaxed">
                <strong className="text-[#FFD95A]">Behavioral Rule:</strong> Consistency beats intensity. Spending 2 minutes logging daily expenses builds financial resilience 10x faster than a stressful 3-hour budget panic once a month.
              </p>
            </div>

            <div className="flex justify-end pt-1">
              <PixelButton variant="wood" size="sm" onClick={onClose}>
                CLOSE BOARD
              </PixelButton>
            </div>
          </StonePanel>
        </WoodFrame>
      </div>
    </div>
  );
}
