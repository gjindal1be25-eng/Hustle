'use client';

import React, { useState } from 'react';
import { BEHAVIORAL_BIASES } from '@/lib/teaching';
import { StonePanel } from '@/components/ui/StonePanel';
import { PixelButton } from '@/components/ui/PixelButton';
import { useGame } from '@/context/GameContext';
import { playCoinSound, playWarningSound } from '@/lib/sound';

export function BehavioralBiasSimulator() {
  const { addRenown } = useGame();
  const [selectedBiasIdx, setSelectedBiasIdx] = useState(0);
  const [userChoice, setUserChoice] = useState<number | null>(null);
  const [completedBiases, setCompletedBiases] = useState<Record<string, number>>({});

  const currentBias = BEHAVIORAL_BIASES[selectedBiasIdx];

  const handleSelectOption = (optIdx: number) => {
    if (userChoice !== null) return;
    setUserChoice(optIdx);

    const option = currentBias.options[optIdx];
    if (option.isCorrect) {
      playCoinSound();
      if (!completedBiases[currentBias.id]) {
        addRenown(option.renownDelta, `Psychology Mastered: ${currentBias.name}`);
        setCompletedBiases((prev) => ({ ...prev, [currentBias.id]: optIdx }));
      }
    } else {
      playWarningSound();
      if (!completedBiases[currentBias.id]) {
        addRenown(option.renownDelta, `Psychology Insight: ${currentBias.name}`);
        setCompletedBiases((prev) => ({ ...prev, [currentBias.id]: optIdx }));
      }
    }
  };

  const handleNextChallenge = () => {
    setUserChoice(null);
    setSelectedBiasIdx((idx) => (idx + 1) % BEHAVIORAL_BIASES.length);
  };

  return (
    <StonePanel className="space-y-4">
      {/* Header */}
      <div className="space-y-1 pb-2 border-b border-[#4B515A]">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-heading text-xs sm:text-sm text-[#FFD95A] flex items-center gap-1.5">
            <span>🧠</span>
            <span>BEHAVIORAL BIAS SIMULATOR</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#9B5DE5]/20 text-[#D8B4E2] border border-[#9B5DE5]/40">
            Psychology &gt; Math
          </span>
        </div>
        <p className="text-xs text-[#B4BAC4]">
          Personal finance is not an Excel spreadsheet; it is emotional self-awareness. Master the four psychological biases that bleed human wealth.
        </p>
      </div>

      {/* Bias Selector Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {BEHAVIORAL_BIASES.map((bias, idx) => {
          const isDone = completedBiases[bias.id] !== undefined;
          return (
            <button
              key={bias.id}
              type="button"
              onClick={() => {
                setSelectedBiasIdx(idx);
                setUserChoice(completedBiases[bias.id] ?? null);
              }}
              className={`text-xs px-2.5 py-1 font-heading border cursor-pointer whitespace-nowrap transition-colors flex items-center gap-1 ${
                selectedBiasIdx === idx
                  ? 'bg-[#FFD95A] text-[#1B1B1F] border-[#FFF4D6] font-bold shadow'
                  : 'bg-[#1B1B1F] text-[#B4BAC4] border-[#4B515A] hover:text-[#FFF4D6]'
              }`}
            >
              <span>{isDone ? '✓' : '⚡'}</span>
              <span>{bias.name.split(' (')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Main Challenge Card */}
      <div className="bg-[#1B1B1F] p-4 rounded border border-[#4B515A] space-y-3">
        {/* Book citation & tag */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#FFD95A] tracking-wider block">
              Cognitive Model #{selectedBiasIdx + 1}
            </span>
            <h3 className="font-heading text-sm text-[#FFF4D6]">
              {currentBias.name}
            </h3>
          </div>
          <span className="text-[11px] text-[#D4A373] italic">
            Inspired by “{currentBias.bookSource}” ({currentBias.author})
          </span>
        </div>

        {/* Tagline */}
        <p className="text-xs text-[#2A9D8F] font-bold italic">
          “{currentBias.tagline}”
        </p>

        {/* Scenario description */}
        <div className="p-3 bg-[#23252B] rounded border border-[#4B515A] text-xs sm:text-sm text-[#FFF4D6] leading-relaxed">
          {currentBias.scenario}
        </div>

        {/* Option choices */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-bold text-[#B4BAC4] uppercase tracking-wider block">
            Choose Your Psychological Reaction:
          </span>

          {currentBias.options.map((opt, oIdx) => {
            const isSelected = userChoice === oIdx;
            const hasAnswered = userChoice !== null;

            let btnStyle = 'bg-[#2E333B] text-[#FFF4D6] border-[#4B515A] hover:border-[#FFD95A]';
            if (hasAnswered) {
              if (opt.isCorrect) {
                btnStyle = 'bg-[#2A9D8F]/25 text-[#FFF4D6] border-[#2A9D8F] font-bold';
              } else if (isSelected && !opt.isCorrect) {
                btnStyle = 'bg-[#E76F51]/25 text-[#FFF4D6] border-[#E76F51]';
              } else {
                btnStyle = 'bg-[#1B1B1F] text-[#8E929A] border-[#3A3F47] opacity-60';
              }
            }

            return (
              <button
                key={oIdx}
                type="button"
                disabled={hasAnswered}
                onClick={() => handleSelectOption(oIdx)}
                className={`w-full text-left p-3 rounded border text-xs sm:text-sm transition-all cursor-pointer flex items-start gap-2.5 ${btnStyle}`}
              >
                <span className="font-heading text-xs text-[#FFD95A] shrink-0 mt-0.5">
                  {String.fromCharCode(65 + oIdx)}.
                </span>
                <span className="leading-snug">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback & Deep Dive Reveal */}
        {userChoice !== null && (
          <div className="space-y-3 pt-2 animate-fadeIn">
            {/* Direct Feedback Callout */}
            <div
              className={`p-3 rounded border text-xs sm:text-sm leading-relaxed ${
                currentBias.options[userChoice].isCorrect
                  ? 'bg-[#2A9D8F]/20 border-[#2A9D8F] text-[#FFF4D6]'
                  : 'bg-[#E76F51]/20 border-[#E76F51] text-[#FFF4D6]'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <span>{currentBias.options[userChoice].isCorrect ? '✅ BRAVO!' : '⚠️ BIAS TRIGGERED!'}</span>
                <span>+{currentBias.options[userChoice].renownDelta} Renown Awarded</span>
              </div>
              <p>{currentBias.options[userChoice].feedback}</p>
            </div>

            {/* Psychological Insight Box */}
            <div className="p-3 bg-[#16171B] rounded border border-[#9B5DE5]/50 space-y-1.5">
              <span className="text-[10px] font-heading text-[#D8B4E2] uppercase tracking-wider block">
                🧠 Psychological Mechanism (Kahneman / Housel):
              </span>
              <p className="text-xs text-[#B4BAC4] leading-relaxed">
                {currentBias.psychologyInsight}
              </p>
              <div className="pt-1 border-t border-[#3A3F47] flex items-center gap-1.5 text-xs text-[#FFD95A]">
                <span>💡 Actionable Antidote:</span>
                <span className="font-bold">{currentBias.actionableRule}</span>
              </div>
            </div>

            {/* Next challenge button */}
            <div className="flex justify-end pt-1">
              <PixelButton variant="gold" onClick={handleNextChallenge}>
                Next Bias Challenge ➔
              </PixelButton>
            </div>
          </div>
        )}
      </div>
    </StonePanel>
  );
}
