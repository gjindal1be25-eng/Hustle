'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { NpcDef } from '@/lib/gameplay';
import { SOCRATIC_DIALOGUES, SocraticDialogue } from '@/lib/teaching';
import { WoodFrame } from '@/components/ui/WoodFrame';
import { StonePanel } from '@/components/ui/StonePanel';
import { PixelButton } from '@/components/ui/PixelButton';
import { useGame } from '@/context/GameContext';
import { playFanfareSound, playWarningSound } from '@/lib/sound';

interface NpcDialogueModalProps {
  npc: NpcDef | null;
  isQuestCompleted: boolean;
  onClose: () => void;
  onCompleteQuest: (questId: string) => void;
}

export function NpcDialogueModal({
  npc,
  isQuestCompleted,
  onClose,
  onCompleteQuest,
}: NpcDialogueModalProps) {
  const { addRenown, dismissLesson } = useGame();
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | null>(null);

  if (!npc) return null;

  const dialogues: SocraticDialogue[] = SOCRATIC_DIALOGUES[npc.id] || [];
  const activeDialogue: SocraticDialogue | undefined = dialogues[0];

  const handleSelectAnswer = (choice: 'A' | 'B') => {
    if (selectedAnswer !== null || !activeDialogue) return;
    setSelectedAnswer(choice);

    const option = choice === 'A' ? activeDialogue.optionA : activeDialogue.optionB;
    if (option.isCorrect) {
      playFanfareSound();
      addRenown(activeDialogue.rewardRenown, `Socratic Wisdom: ${npc.name}`);
      if (activeDialogue.unlocksLessonId) {
        dismissLesson(activeDialogue.unlocksLessonId);
      }
    } else {
      playWarningSound();
    }
  };

  const choiceMade = selectedAnswer !== null;
  const currentOption = selectedAnswer === 'A' ? activeDialogue?.optionA : activeDialogue?.optionB;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <WoodFrame
          title={npc.name.toUpperCase()}
          subtitle={npc.role}
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

            {/* NPC Character Greeting Header */}
            <div className="flex gap-3 items-start bg-[#23252B] p-3 rounded border border-[#4B515A]">
              <div
                className="w-12 h-12 rounded flex items-center justify-center text-2xl shrink-0 border border-[#B79A60] shadow"
                style={{ backgroundColor: npc.shirtColor }}
              >
                {npc.id === 'kaka' ? '☕' : npc.id === 'uncle_sharma' ? '👓' : '📚'}
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#FFD95A] tracking-wider uppercase block">
                  {npc.role}
                </span>
                <p className="text-xs sm:text-sm text-[#FFF4D6] italic leading-relaxed">
                  {npc.quip}
                </p>
              </div>
            </div>

            {/* Socratic Dialogue Challenge Section */}
            {activeDialogue && (
              <div className="bg-[#1B1B1F] p-3.5 rounded border-2 border-[#FFD95A] space-y-3 shadow">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-heading text-[#FFD95A] flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>SOCRATIC QUESTION:</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFD95A]/20 text-[#FFD95A] font-bold border border-[#FFD95A]/30">
                    +{activeDialogue.rewardRenown} ⭐ + Scroll Unlock
                  </span>
                </div>

                {/* The Socratic Question */}
                <p className="text-xs sm:text-sm font-body text-[#FFF4D6] leading-relaxed">
                  {activeDialogue.question}
                </p>

                {/* Two Distinct Responses */}
                <div className="space-y-2 pt-1">
                  {/* Option A */}
                  <button
                    type="button"
                    disabled={choiceMade}
                    onClick={() => handleSelectAnswer('A')}
                    className={`w-full text-left p-2.5 rounded border text-xs sm:text-sm transition-all cursor-pointer flex items-start gap-2 ${
                      selectedAnswer === 'A'
                        ? activeDialogue.optionA.isCorrect
                          ? 'bg-[#2A9D8F]/25 text-[#FFF4D6] border-[#2A9D8F] font-bold'
                          : 'bg-[#E76F51]/25 text-[#FFF4D6] border-[#E76F51]'
                        : choiceMade && activeDialogue.optionA.isCorrect
                        ? 'bg-[#2A9D8F]/20 text-[#FFF4D6] border-[#2A9D8F]'
                        : 'bg-[#2E333B] text-[#FFF4D6] border-[#4B515A] hover:border-[#FFD95A]'
                    }`}
                  >
                    <span className="font-heading text-xs text-[#FFD95A] shrink-0">A.</span>
                    <span className="leading-snug">{activeDialogue.optionA.text}</span>
                  </button>

                  {/* Option B */}
                  <button
                    type="button"
                    disabled={choiceMade}
                    onClick={() => handleSelectAnswer('B')}
                    className={`w-full text-left p-2.5 rounded border text-xs sm:text-sm transition-all cursor-pointer flex items-start gap-2 ${
                      selectedAnswer === 'B'
                        ? activeDialogue.optionB.isCorrect
                          ? 'bg-[#2A9D8F]/25 text-[#FFF4D6] border-[#2A9D8F] font-bold'
                          : 'bg-[#E76F51]/25 text-[#FFF4D6] border-[#E76F51]'
                        : choiceMade && activeDialogue.optionB.isCorrect
                        ? 'bg-[#2A9D8F]/20 text-[#FFF4D6] border-[#2A9D8F]'
                        : 'bg-[#2E333B] text-[#FFF4D6] border-[#4B515A] hover:border-[#FFD95A]'
                    }`}
                  >
                    <span className="font-heading text-xs text-[#FFD95A] shrink-0">B.</span>
                    <span className="leading-snug">{activeDialogue.optionB.text}</span>
                  </button>
                </div>

                {/* Reveal Feedback */}
                {choiceMade && currentOption && (
                  <div
                    className={`p-3 rounded border text-xs sm:text-sm leading-relaxed animate-fadeIn ${
                      currentOption.isCorrect
                        ? 'bg-[#2A9D8F]/20 border-[#2A9D8F] text-[#FFF4D6]'
                        : 'bg-[#E76F51]/20 border-[#E76F51] text-[#FFF4D6]'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 mb-1">
                      <span>{currentOption.isCorrect ? '🌟 CORRECT!' : '💭 VILLAGER COUNSEL:'}</span>
                      {currentOption.isCorrect && <span>+{activeDialogue.rewardRenown} Renown Awarded</span>}
                    </div>
                    <p>{currentOption.feedback}</p>
                    {currentOption.isCorrect && activeDialogue.unlocksLessonId && (
                      <div className="mt-2 text-[11px] text-[#FFD95A] font-bold flex items-center gap-1">
                        <span>📜</span>
                        <span>Unlocked Scroll #{activeDialogue.unlocksLessonId} in the School of Wisdom!</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Daily Bounty Card */}
            <div className="bg-[#1B1B1F] p-3 rounded border border-[#4B515A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading text-[#FFD95A] flex items-center gap-1.5">
                  <span>📜</span>
                  <span>DAILY BOUNTY: {npc.bounty.title}</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#2A9D8F]/20 text-[#2A9D8F] font-bold border border-[#2A9D8F]/40">
                  +{npc.bounty.rewardRenown} Renown
                </span>
              </div>
              <p className="text-xs text-[#B4BAC4]">
                {npc.bounty.desc}
              </p>
            </div>

            {/* Action buttons & Book mode link */}
            <div className="flex items-center justify-between pt-2 border-t border-[#4B515A] flex-wrap gap-2">
              <Link
                href="/school?tab=book"
                onClick={onClose}
                className="text-xs text-[#FFD95A] hover:underline flex items-center gap-1 font-heading"
              >
                <span>📖</span>
                <span>Open Town Library (Book Mode) ➔</span>
              </Link>

              <div className="flex gap-2 items-center">
                <PixelButton variant="stone" onClick={onClose}>
                  Done
                </PixelButton>
                {isQuestCompleted ? (
                  <div className="px-3 py-1.5 rounded bg-[#2A9D8F]/20 border border-[#2A9D8F] text-[#2A9D8F] text-xs font-bold flex items-center gap-1.5">
                    <span>✓</span> Bounty Claimed!
                  </div>
                ) : (
                  <PixelButton
                    variant="primary"
                    onClick={() => {
                      onCompleteQuest(npc.bounty.id);
                      onClose();
                    }}
                  >
                    Claim Bounty (+{npc.bounty.rewardRenown} ⭐)
                  </PixelButton>
                )}
              </div>
            </div>
          </StonePanel>
        </WoodFrame>
      </div>
    </div>
  );
}
