'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { WoodFrame } from '@/components/ui/WoodFrame';
import { StonePanel } from '@/components/ui/StonePanel';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelInput } from '@/components/ui/PixelInput';
import { CharacterSprite } from '@/components/ui/CharacterSprite';
import { RpgTextBox } from '@/components/ui/RpgTextBox';
import { AVATAR_PRESETS } from '@/lib/constants';
import { CareerPath } from '@/lib/types';
import { getTodayISO } from '@/lib/rules';

export function SetupFlow() {
  const { setProfile, loadDemo } = useGame();

  const [step, setStep] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [hairColor, setHairColor] = useState<string>(AVATAR_PRESETS.hairColors[0].value);
  const [outfitColor, setOutfitColor] = useState<string>(AVATAR_PRESETS.outfitColors[0].value);
  const [careerPath, setCareerPath] = useState<CareerPath>('corporate');
  const [openingBalance, setOpeningBalance] = useState<string>('5000');
  const [error, setError] = useState<string>('');

  const handleNext = () => {
    setError('');
    if (step === 1 && !name.trim()) {
      setError('Please tell us your name to proceed!');
      return;
    }
    if (step === 4) {
      const balanceNum = parseFloat(openingBalance);
      if (isNaN(balanceNum) || balanceNum < 0) {
        setError('Please enter a valid starting balance (₹0 or greater).');
        return;
      }
      // Finish setup
      setProfile({
        name: name.trim() || 'Hero',
        avatar: { hairColor, outfitColor },
        path: careerPath,
        openingBalance: balanceNum,
        createdAt: getTodayISO(),
        onboardingDone: true,
        theme: 'system',
      });
      return;
    }
    setStep((prev) => prev + 1);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Title Screen / Intro */}
      {step === 0 && (
        <WoodFrame showBackToTown={false} className="text-center py-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-xs sm:text-sm font-heading text-[#FFD95A] tracking-widest uppercase">
                ✦ BIOS HACKATHON V2 ✦
              </span>
              <h1 className="text-3xl sm:text-5xl font-heading text-[#FFD95A] tracking-wider drop-shadow-[0_4px_0_#2A180E]">
                HUSTLE
              </h1>
              <p className="text-lg sm:text-2xl font-body text-[#FFF4D6] max-w-md mx-auto">
                Budgeting that teaches by showing you the life your habits would build.
              </p>
            </div>

            <div className="py-4 flex justify-center">
              <CharacterSprite
                hairColor={hairColor}
                outfitColor={outfitColor}
                mood="celebrating"
                size={84}
                animate={true}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
              <PixelButton
                variant="gold"
                size="lg"
                onClick={() => setStep(1)}
                className="w-full sm:w-auto"
              >
                ⚔️ Start Adventure
              </PixelButton>

              <PixelButton
                variant="stone"
                size="lg"
                onClick={() => loadDemo()}
                className="w-full sm:w-auto"
              >
                🏛️ Load Judge Demo
              </PixelButton>
            </div>
          </div>
        </WoodFrame>
      )}

      {/* Step 1: Character Name */}
      {step === 1 && (
        <WoodFrame
          title="SETUP (1/4)"
          subtitle="Choose your adventurer's identity"
          showBackToTown={false}
        >
          <div className="space-y-6">
            <RpgTextBox
              speakerName="Town Elder"
              mood="happy"
              message="Welcome, traveler! Every empire starts with a single name. What shall we call you?"
            />

            <StonePanel title="Adventurer Name">
              <PixelInput
                label="Your Name"
                placeholder="e.g. Alex, Maya, Gurpreet..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={error}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              />
            </StonePanel>

            <div className="flex justify-between items-center pt-2">
              <PixelButton variant="stone" onClick={() => setStep(0)}>
                Back
              </PixelButton>
              <PixelButton variant="wood" onClick={handleNext}>
                Next: Customize Look ➔
              </PixelButton>
            </div>
          </div>
        </WoodFrame>
      )}

      {/* Step 2: Avatar Designer */}
      {step === 2 && (
        <WoodFrame
          title="SETUP (2/4)"
          subtitle="Design your pixel adventurer"
          showBackToTown={false}
        >
          <div className="space-y-6">
            <RpgTextBox
              speakerName={name || 'Hero'}
              mood="happy"
              message="Looking sharp! Pick your signature hair and outfit colors."
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              {/* Live Preview Slot */}
              <StonePanel variant="inset" className="flex flex-col items-center justify-center py-6">
                <CharacterSprite
                  hairColor={hairColor}
                  outfitColor={outfitColor}
                  mood="happy"
                  size={96}
                  animate={true}
                />
                <span className="font-heading text-xs text-[#FFD95A] mt-3">
                  {name || 'Hero'}
                </span>
              </StonePanel>

              {/* Palette Selectors */}
              <div className="sm:col-span-2 space-y-4">
                <StonePanel title="Hair Color (6 Presets)">
                  <div className="grid grid-cols-3 gap-2">
                    {AVATAR_PRESETS.hairColors.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setHairColor(c.value)}
                        className={`flex items-center gap-2 p-1.5 border-2 cursor-pointer transition-all ${
                          hairColor === c.value
                            ? 'border-[#FFD95A] bg-[#1B1B1F]'
                            : 'border-[#4E5561] bg-[#2E333B] hover:border-[#FFF4D6]'
                        }`}
                      >
                        <span
                          className="w-4 h-4 border border-[#1B1B1F]"
                          style={{ backgroundColor: c.value }}
                        />
                        <span className="text-xs font-body text-[#FFF4D6]">
                          {c.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </StonePanel>

                <StonePanel title="Outfit Color (6 Presets)">
                  <div className="grid grid-cols-3 gap-2">
                    {AVATAR_PRESETS.outfitColors.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setOutfitColor(c.value)}
                        className={`flex items-center gap-2 p-1.5 border-2 cursor-pointer transition-all ${
                          outfitColor === c.value
                            ? 'border-[#FFD95A] bg-[#1B1B1F]'
                            : 'border-[#4E5561] bg-[#2E333B] hover:border-[#FFF4D6]'
                        }`}
                      >
                        <span
                          className="w-4 h-4 border border-[#1B1B1F]"
                          style={{ backgroundColor: c.value }}
                        />
                        <span className="text-xs font-body text-[#FFF4D6]">
                          {c.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </StonePanel>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <PixelButton variant="stone" onClick={() => setStep(1)}>
                Back
              </PixelButton>
              <PixelButton variant="wood" onClick={handleNext}>
                Next: Career Path ➔
              </PixelButton>
            </div>
          </div>
        </WoodFrame>
      )}

      {/* Step 3: Career Path Selection */}
      {step === 3 && (
        <WoodFrame
          title="SETUP (3/4)"
          subtitle="Choose your starting profession"
          showBackToTown={false}
        >
          <div className="space-y-6">
            <RpgTextBox
              speakerName={name || 'Hero'}
              mood="side-eye"
              message="How do you make your living in this world? You can switch this at any time without losing progress."
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setCareerPath('corporate')}
                className={`p-4 border-2 text-left cursor-pointer transition-all ${
                  careerPath === 'corporate'
                    ? 'border-[#FFD95A] bg-[#2E333B] shadow-[0_4px_0_#997300]'
                    : 'border-[#4E5561] bg-[#1E2024] hover:border-[#FFF4D6]'
                }`}
              >
                <div className="text-2xl mb-2">🏢</div>
                <h3 className="font-heading text-sm text-[#FFD95A] mb-1">
                  Corporate Job
                </h3>
                <p className="text-xs font-body text-[#B4BAC4] leading-relaxed">
                  Predictable salary, corporate ladder. Ranks from Guard to CEO.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setCareerPath('business')}
                className={`p-4 border-2 text-left cursor-pointer transition-all ${
                  careerPath === 'business'
                    ? 'border-[#FFD95A] bg-[#2E333B] shadow-[0_4px_0_#997300]'
                    : 'border-[#4E5561] bg-[#1E2024] hover:border-[#FFF4D6]'
                }`}
              >
                <div className="text-2xl mb-2">🏪</div>
                <h3 className="font-heading text-sm text-[#FFD95A] mb-1">
                  Business Owner
                </h3>
                <p className="text-xs font-body text-[#B4BAC4] leading-relaxed">
                  Enterprise builder. Ranks from Street Vendor to Tycoon.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setCareerPath('freelancer')}
                className={`p-4 border-2 text-left cursor-pointer transition-all ${
                  careerPath === 'freelancer'
                    ? 'border-[#FFD95A] bg-[#2E333B] shadow-[0_4px_0_#997300]'
                    : 'border-[#4E5561] bg-[#1E2024] hover:border-[#FFF4D6]'
                }`}
              >
                <div className="text-2xl mb-2">🎨</div>
                <h3 className="font-heading text-sm text-[#FFD95A] mb-1">
                  Freelancer / Creator
                </h3>
                <p className="text-xs font-body text-[#B4BAC4] leading-relaxed">
                  Independent craftsperson. Ranks from Gig Starter to Creative Mogul.
                </p>
              </button>
            </div>

            <div className="flex justify-between items-center pt-2">
              <PixelButton variant="stone" onClick={() => setStep(2)}>
                Back
              </PixelButton>
              <PixelButton variant="wood" onClick={handleNext}>
                Next: Opening Balance ➔
              </PixelButton>
            </div>
          </div>
        </WoodFrame>
      )}

      {/* Step 4: Opening Balance */}
      {step === 4 && (
        <WoodFrame
          title="SETUP (4/4)"
          subtitle="Your starting bankroll"
          showBackToTown={false}
        >
          <div className="space-y-6">
            <RpgTextBox
              speakerName={name || 'Hero'}
              mood="happy"
              message="Almost ready to enter town! How much cash (₹) do you currently have in your wallet or bank?"
            />

            <StonePanel title="Starting Balance">
              <PixelInput
                label="Opening Cash Balance (₹)"
                prefix="₹"
                type="number"
                min="0"
                step="100"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                error={error}
                helperText="This establishes your initial liquid net worth."
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              />
            </StonePanel>

            <div className="flex justify-between items-center pt-2">
              <PixelButton variant="stone" onClick={() => setStep(3)}>
                Back
              </PixelButton>
              <PixelButton variant="gold" size="lg" onClick={handleNext}>
                Enter Town ➔
              </PixelButton>
            </div>
          </div>
        </WoodFrame>
      )}
    </div>
  );
}
