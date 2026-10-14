'use client';

import React, { useState } from 'react';
import { WoodFrame } from '@/components/ui/WoodFrame';
import { StonePanel } from '@/components/ui/StonePanel';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelInput } from '@/components/ui/PixelInput';
import { PixelSelect } from '@/components/ui/PixelSelect';
import { PixelChip } from '@/components/ui/PixelChip';
import { CharacterSprite, MoodType } from '@/components/ui/CharacterSprite';
import { RpgTextBox } from '@/components/ui/RpgTextBox';
import { HudBar } from '@/components/ui/HudBar';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { useGame } from '@/context/GameContext';

export default function UiKitPage() {
  const { addToast } = useGame();
  const [selectedMood, setSelectedMood] = useState<MoodType>('neutral');
  const [inputValue, setInputValue] = useState('₹ 1,500');

  const moods: MoodType[] = [
    'neutral',
    'happy',
    'worried',
    'sad',
    'side-eye',
    'celebrating',
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-8 font-body">
      <HudBar />
      <ToastContainer />

      <WoodFrame
        title="HUSTLE UI KIT"
        subtitle="Wood & Stone RPG Design System — Showcase & Living Spec"
      >
        <div className="space-y-6">
          {/* Section: Buttons */}
          <StonePanel title="Action Buttons">
            <div className="flex flex-wrap items-center gap-4">
              <PixelButton variant="wood" onClick={() => addToast('Primary Action', 'Wood button clicked!', 'info')}>
                🪵 Wood Button (Primary)
              </PixelButton>
              <PixelButton variant="stone" onClick={() => addToast('Secondary Action', 'Stone button clicked!', 'info')}>
                🪨 Stone Button
              </PixelButton>
              <PixelButton variant="danger" onClick={() => addToast('Alert', 'Destructive button clicked!', 'alert')}>
                ⚠️ Danger Button
              </PixelButton>
              <PixelButton variant="gold" onClick={() => addToast('Jackpot!', 'Gold celebration button clicked!', 'success')}>
                🪙 Gold Button
              </PixelButton>
              <PixelButton variant="wood" disabled>
                Disabled Button
              </PixelButton>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-[#4E5561]">
              <PixelButton size="sm">Small</PixelButton>
              <PixelButton size="md">Medium</PixelButton>
              <PixelButton size="lg">Large Button</PixelButton>
            </div>
          </StonePanel>

          {/* Section: Inputs and Selects */}
          <StonePanel title="Form Inputs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PixelInput
                label="Amount Input"
                prefix="₹"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                helperText="Enter transaction amount"
              />
              <PixelInput
                label="Error Input State"
                defaultValue="invalid_data"
                error="Amount must be greater than zero!"
              />
              <PixelSelect
                label="Category Selection"
                options={[
                  { value: 'food', label: 'Food (Need)' },
                  { value: 'rent', label: 'Rent (Need)' },
                  { value: 'shopping', label: 'Shopping (Want)' },
                  { value: 'fun', label: 'Fun (Want)' },
                ]}
              />
              <div className="flex flex-col gap-2">
                <span className="text-xs font-heading text-[#FFF4D6] uppercase">
                  Interactive Chips
                </span>
                <div className="flex flex-wrap gap-2">
                  <PixelChip label="Need Tag" variant="need" />
                  <PixelChip label="Want Tag" variant="want" />
                  <PixelChip label="Normal (OK)" variant="normal" />
                  <PixelChip label="Warning (80%)" variant="warning" />
                  <PixelChip label="Danger (100%+)" variant="danger" />
                </div>
              </div>
            </div>
          </StonePanel>

          {/* Section: Character Sprites and Expressions */}
          <StonePanel title="Character Sprites & 6 Expressions">
            <div className="flex flex-wrap items-end justify-around gap-6 p-4 bg-[#1B1B1F] border border-[#4E5561]">
              {moods.map((m) => (
                <div
                  key={m}
                  onClick={() => setSelectedMood(m)}
                  className={`flex flex-col items-center gap-2 cursor-pointer p-2 border-2 transition-all ${
                    selectedMood === m
                      ? 'border-[#FFD95A] bg-[#2E333B]'
                      : 'border-transparent hover:border-[#4E5561]'
                  }`}
                >
                  <CharacterSprite mood={m} size={54} animate={true} />
                  <span className="font-heading text-[10px] uppercase text-[#FFF4D6]">
                    {m}
                  </span>
                </div>
              ))}
            </div>
          </StonePanel>

          {/* Section: RPG Dialogue Textbox */}
          <StonePanel title="RPG Dialogue Box">
            <RpgTextBox
              speakerName="Demo (Clerk)"
              mood={selectedMood}
              message="Welcome to Hustle town! Every gold coin you save builds the city taller and brighter."
              whyLine="You have saved 1.2 months of income, unlocking Level 2 (Clerk)."
            />
          </StonePanel>

          {/* Section: Stone Panel Slabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StonePanel variant="dark" title="Dark Panel">
              <p className="text-sm">Default stone panel for content containers.</p>
            </StonePanel>
            <StonePanel variant="slab" title="Slab Panel">
              <p className="text-sm">Lighter stone slab for charts and data tables.</p>
            </StonePanel>
            <StonePanel variant="inset" title="Inset Panel">
              <p className="text-sm">Deep inset stone slot for logs and lists.</p>
            </StonePanel>
          </div>

          {/* Section: Notification Triggers */}
          <StonePanel title="Toast Notifications Test">
            <div className="flex flex-wrap gap-3">
              <PixelButton
                variant="stone"
                size="sm"
                onClick={() => addToast('Notice', 'System state synced cleanly.', 'info')}
              >
                Trigger Info Toast
              </PixelButton>
              <PixelButton
                variant="wood"
                size="sm"
                onClick={() => addToast('Success! 🌟', 'Goal progress updated by ₹5,000.', 'success')}
              >
                Trigger Success Toast
              </PixelButton>
              <PixelButton
                variant="wood"
                size="sm"
                onClick={() => addToast('Warning ⚠️', 'Food category is at 88% of limit.', 'warning')}
              >
                Trigger Warning Toast
              </PixelButton>
              <PixelButton
                variant="danger"
                size="sm"
                onClick={() => addToast('Alert 🚨', 'Debt spiral risk! EMI load above 40%.', 'alert')}
              >
                Trigger Alert Toast
              </PixelButton>
            </div>
          </StonePanel>
        </div>
      </WoodFrame>
    </div>
  );
}
