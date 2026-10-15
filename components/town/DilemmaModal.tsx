'use client';

import React from 'react';
import { Dilemma } from '@/lib/gameplay';
import { WoodFrame } from '@/components/ui/WoodFrame';
import { StonePanel } from '@/components/ui/StonePanel';
import { PixelButton } from '@/components/ui/PixelButton';

interface DilemmaModalProps {
  dilemma: Dilemma | null;
  onClose: () => void;
  onChoose: (choiceIndex: number) => void;
}

export function DilemmaModal({ dilemma, onClose, onChoose }: DilemmaModalProps) {
  if (!dilemma) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg">
        <WoodFrame
          title="LIFE EVENT DILEMMA"
          subtitle="Real-world financial choice"
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
            {/* Dilemma Header & Scenario */}
            <div className="bg-[#23252B] p-3 sm:p-4 rounded border border-[#4B515A] space-y-2">
              <h3 className="text-sm sm:text-base font-heading text-[#FFD95A]">
                {dilemma.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#FFF4D6] leading-relaxed">
                {dilemma.scenario}
              </p>
            </div>

            {/* Two Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A */}
              <div
                onClick={() => onChoose(0)}
                className="group cursor-pointer bg-[#1B1B1F] hover:bg-[#2A2B33] transition-all p-3 rounded border-2 border-[#4B515A] hover:border-[#2A9D8F] flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2A9D8F] uppercase tracking-wider">
                      Choice A
                    </span>
                    <span className="text-xs text-[#FFD95A] font-bold">
                      +{dilemma.optionA.renownAdd} Renown
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#FFF4D6] font-semibold">
                    {dilemma.optionA.text}
                  </p>
                </div>
                <PixelButton variant="primary" className="w-full text-xs" onClick={() => onChoose(0)}>
                  Choose Option A
                </PixelButton>
              </div>

              {/* Option B */}
              <div
                onClick={() => onChoose(1)}
                className="group cursor-pointer bg-[#1B1B1F] hover:bg-[#2A2B33] transition-all p-3 rounded border-2 border-[#4B515A] hover:border-[#E76F51] flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#E76F51] uppercase tracking-wider">
                      Choice B
                    </span>
                    <span className="text-xs text-[#FFD95A] font-bold">
                      +{dilemma.optionB.renownAdd} Renown
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#FFF4D6] font-semibold">
                    {dilemma.optionB.text}
                  </p>
                </div>
                <PixelButton variant="stone" className="w-full text-xs" onClick={() => onChoose(1)}>
                  Choose Option B
                </PixelButton>
              </div>
            </div>

            {/* Philosophy tip */}
            <p className="text-[11px] text-[#B4BAC4] text-center italic">
              Every financial choice shapes your cash cushion, peace of mind, and town renown.
            </p>
          </StonePanel>
        </WoodFrame>
      </div>
    </div>
  );
}
