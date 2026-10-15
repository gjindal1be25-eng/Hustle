'use client';

import React from 'react';
import { CharacterSprite, MoodType } from './CharacterSprite';
import { useGame } from '@/context/GameContext';

interface RpgTextBoxProps {
  speakerName?: string;
  message?: string;
  whyLine?: string;
  mood?: MoodType;
  className?: string;
}

export function RpgTextBox({
  speakerName,
  message,
  whyLine,
  mood = 'neutral',
  className = '',
}: RpgTextBoxProps) {
  const { state, activeReaction, activeEvent } = useGame();

  const currentName = speakerName || state.profile?.name || 'Hero';
  const currentMood =
    mood || activeReaction?.mood || (activeEvent.type === 'debt_spiral' ? 'worried' : activeEvent.type === 'stranded' ? 'sad' : 'neutral');
  const currentMessage = message || activeReaction?.message || activeEvent.eventLine;
  const currentWhy = whyLine !== undefined ? whyLine : activeEvent.whyLine;

  const hair = state.profile?.avatar.hairColor || '#2C1810';
  const outfit = state.profile?.avatar.outfitColor || '#2B4C7E';

  return (
    <div
      className={`relative w-full min-h-[96px] bg-[#121316] border-[3px] border-[#FFD95A] shadow-[0_4px_0_#0D0E10] p-3 flex items-center gap-3.5 select-none ${className}`}
    >
      {/* Name Tab on top-left border */}
      <div className="absolute -top-3.5 left-4 px-3 py-0.5 bg-[#FFD95A] border-2 border-[#1B1B1F] text-[#1B1B1F] font-heading text-[10px] sm:text-xs uppercase tracking-wider shadow-[0_2px_0_#997300]">
        {currentName}
      </div>

      {/* Character Thumbnail */}
      <div className="flex-shrink-0 w-12 h-16 flex items-center justify-center bg-[#1E2024] border border-[#4E5561] p-1 shadow-inner">
        <CharacterSprite
          hairColor={hair}
          outfitColor={outfit}
          mood={currentMood}
          size={36}
          animate={true}
        />
      </div>

      {/* Dialogue Area: 12px padding clearance, clear of top name tab */}
      <div className="flex-1 min-w-0 flex flex-col justify-center py-1 pt-2 max-h-[88px] overflow-y-auto">
        <p className="font-body text-sm sm:text-base text-[#FFF4D6] leading-relaxed tracking-normal break-words">
          &ldquo;{currentMessage}&rdquo;
        </p>

        {currentWhy && (
          <p className="font-body text-xs text-[#D4A373] mt-1 opacity-90 leading-normal break-words">
            🔍 {currentWhy}
          </p>
        )}
      </div>

      {/* Blinking Dialogue Advance Arrow */}
      <div className="self-end pb-1 text-[#FFD95A] text-xs font-heading animate-pulse">
        ▼
      </div>
    </div>
  );
}
