'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { SetupFlow } from '@/components/setup/SetupFlow';
import { HudBar } from '@/components/ui/HudBar';
import { Town } from '@/components/town/Town';
import { RpgTextBox } from '@/components/ui/RpgTextBox';
import { PixelButton } from '@/components/ui/PixelButton';
import { StonePanel } from '@/components/ui/StonePanel';

export default function HomePage() {
  const { state, isLoaded, pendingLesson, dismissLesson } = useGame();

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="font-heading text-sm text-[#FFD95A] animate-pulse">
          Loading Hustle world...
        </div>
      </div>
    );
  }

  // If user has not completed setup, show the SetupFlow
  if (!state.profile) {
    return <SetupFlow />;
  }

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-[#1B1B1F]">
      {/* 40px Top HUD Bar */}
      <HudBar />

      {/* Main Town Shell Container */}
      <div className="w-full max-w-4xl px-3 sm:px-6 py-4 flex flex-col items-center gap-4 flex-1">
        {/* Floating Isometric Town SVG */}
        <div className="w-full">
          <Town />
        </div>



        {/* 96px Bottom RPG Dialogue Text Box */}
        <div className="w-full mt-auto pt-2">
          <RpgTextBox />
        </div>
      </div>

      {/* Triggered Lesson Pop-up Card Modal */}
      {pendingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="max-w-md w-full">
            <StonePanel
              title={`Financial Wisdom #${pendingLesson.id}`}
              variant="slab"
              className="border-[3px] border-[#FFD95A] shadow-[0_8px_0_#000]"
            >
              <div className="space-y-4">
                <div>
                  <h3 className="font-heading text-base sm:text-lg text-[#FFD95A] mb-1">
                    {pendingLesson.title}
                  </h3>
                  <p className="text-xs font-body text-[#D4A373] italic">
                    Inspired by &ldquo;{pendingLesson.book}&rdquo;
                  </p>
                </div>

                <div className="p-3 bg-[#1B1B1F] border border-[#4E5561]">
                  <p className="font-body text-lg text-[#FFF4D6] leading-relaxed">
                    &ldquo;{pendingLesson.cardText}&rdquo;
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <PixelButton
                    variant="gold"
                    onClick={() => dismissLesson(pendingLesson.id)}
                  >
                    Got It! (Add to School) ➔
                  </PixelButton>
                </div>
              </div>
            </StonePanel>
          </div>
        </div>
      )}
    </div>
  );
}
