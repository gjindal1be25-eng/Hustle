'use client';

import React from 'react';
import { NpcDef } from '@/lib/gameplay';
import { WoodFrame } from '@/components/ui/WoodFrame';
import { StonePanel } from '@/components/ui/StonePanel';
import { PixelButton } from '@/components/ui/PixelButton';

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
  if (!npc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md">
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
            {/* NPC Quote Speech Bubble */}
            <div className="flex gap-3 items-start bg-[#23252B] p-3 rounded border border-[#4B515A]">
              <div
                className="w-12 h-12 rounded flex items-center justify-center text-2xl shrink-0 border border-[#B79A60]"
                style={{ backgroundColor: npc.shirtColor }}
              >
                {npc.id === 'kaka' ? '☕' : npc.id === 'uncle_sharma' ? '👓' : '📚'}
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#FFD95A] tracking-wider uppercase">
                  {npc.role}
                </span>
                <p className="text-xs sm:text-sm text-[#FFF4D6] italic leading-relaxed">
                  {npc.quip}
                </p>
              </div>
            </div>

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

            {/* Action buttons */}
            <div className="flex gap-3 justify-end pt-2">
              <PixelButton variant="stone" onClick={onClose}>
                Later
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
          </StonePanel>
        </WoodFrame>
      </div>
    </div>
  );
}
