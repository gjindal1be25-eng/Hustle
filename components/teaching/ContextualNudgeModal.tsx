'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { WoodFrame } from '@/components/ui/WoodFrame';
import { StonePanel } from '@/components/ui/StonePanel';
import { PixelButton } from '@/components/ui/PixelButton';
import { playButtonSound, playFanfareSound } from '@/lib/sound';

export function ContextualNudgeModal() {
  const router = useRouter();
  const { activeContextualNudge, dismissContextualNudge, addRenown } = useGame();

  if (!activeContextualNudge) return null;

  const nudge = activeContextualNudge;

  const handlePrimaryClick = () => {
    playButtonSound();
    if (nudge.rewardRenown) {
      addRenown(nudge.rewardRenown, `Wisdom Nudge: ${nudge.title}`);
      playFanfareSound();
    }

    if (nudge.primaryAction.actionType === 'time_machine' && nudge.primaryAction.href) {
      dismissContextualNudge();
      router.push(nudge.primaryAction.href);
      return;
    }

    dismissContextualNudge();
  };

  const handleSecondaryClick = () => {
    playButtonSound();
    if (nudge.secondaryAction?.actionType === 'time_machine' && nudge.secondaryAction.href) {
      dismissContextualNudge();
      router.push(nudge.secondaryAction.href);
      return;
    }
    dismissContextualNudge();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg">
        <WoodFrame
          title={nudge.title.toUpperCase()}
          subtitle={nudge.subtitle}
          showBackToTown={false}
        >
          <StonePanel className="space-y-4 relative">
            {/* Close Cross */}
            <button
              type="button"
              onClick={dismissContextualNudge}
              className="absolute top-2 right-2 text-[#B4BAC4] hover:text-[#FFF4D6] text-xs px-2 py-0.5 rounded border border-[#4B515A] cursor-pointer bg-[#1B1B1F] z-10"
              title="Dismiss"
            >
              ✕
            </button>

            {/* Character Header & Speech Bubble */}
            <div className="flex gap-3 items-start bg-[#23252B] p-3 rounded border border-[#4B515A]">
              <div
                className="w-14 h-14 rounded flex items-center justify-center text-3xl shrink-0 border-2 border-[#B79A60] shadow"
                style={{ backgroundColor: nudge.shirtColor }}
              >
                {nudge.avatarEmoji}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-xs sm:text-sm text-[#FFD95A]">
                    {nudge.characterName}
                  </h3>
                  <span className="text-[10px] text-[#B4BAC4] uppercase font-mono tracking-wider">
                    ({nudge.characterRole})
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#FFF4D6] leading-relaxed italic">
                  {nudge.quote}
                </p>
              </div>
            </div>

            {/* Calculation / Impact Callout Box */}
            {nudge.calculationBox && (
              <div className="bg-[#17181C] p-3 rounded border-2 border-[#FFD95A] space-y-1 shadow">
                <span className="text-[10px] font-mono uppercase text-[#D4A373] tracking-wider block">
                  {nudge.calculationBox.label}:
                </span>
                <div className="text-base sm:text-lg font-heading text-[#FFD95A]">
                  {nudge.calculationBox.value}
                </div>
                <p className="text-xs text-[#B4BAC4]">
                  {nudge.calculationBox.comparison}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 flex-wrap">
              {nudge.secondaryAction && (
                <PixelButton variant="stone" onClick={handleSecondaryClick}>
                  {nudge.secondaryAction.label}
                </PixelButton>
              )}
              <PixelButton variant="gold" onClick={handlePrimaryClick}>
                {nudge.primaryAction.label}
              </PixelButton>
            </div>
          </StonePanel>
        </WoodFrame>
      </div>
    </div>
  );
}
