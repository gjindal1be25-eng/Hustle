'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import { WoodFrame } from '@/components/ui/WoodFrame';
import { StonePanel } from '@/components/ui/StonePanel';
import { PixelButton } from '@/components/ui/PixelButton';
import { CharacterSprite } from '@/components/ui/CharacterSprite';
import { RpgTextBox } from '@/components/ui/RpgTextBox';
import { HudBar } from '@/components/ui/HudBar';
import { AVATAR_PRESETS } from '@/lib/constants';
import { CareerPath } from '@/lib/types';

export default function SettingsPage() {
  const router = useRouter();
  const {
    state,
    setCareerPath,
    updateProfile,
    loadDemo,
    resetAll,
    toggleRecurring,
    deleteRecurring,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'profile' | 'data'>('profile');
  const [confirmReset, setConfirmReset] = useState(false);
  const [showAllRecurring, setShowAllRecurring] = useState(false);

  const profile = state.profile;
  const hair = profile?.avatar.hairColor || AVATAR_PRESETS.hairColors[0].value;
  const outfit = profile?.avatar.outfitColor || AVATAR_PRESETS.outfitColors[0].value;

  const handleResetConfirm = () => {
    resetAll();
    router.push('/');
  };

  const displayedRecurring = showAllRecurring
    ? state.recurring
    : state.recurring.slice(0, 3);

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-[#1B1B1F]">
      <HudBar />

      <div className="w-full max-w-[720px] px-3 sm:px-4 py-4 space-y-4 flex-1">
        <WoodFrame
          title="TOWN SETTINGS"
          subtitle="Customize your career path, avatar styling, and game parameters"
        >
          {/* Single Calm Stone Panel with Gold Tab Underline */}
          <StonePanel className="space-y-4">
            {/* Tabs with Gold Underline */}
            <div className="flex border-b border-[#4B515A] gap-6 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`pb-1 text-xs sm:text-sm font-heading cursor-pointer transition-colors ${
                  activeTab === 'profile'
                    ? 'text-[#FFD95A] border-b-2 border-[#FFD95A]'
                    : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
                }`}
              >
                Profile & Persona
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('data')}
                className={`pb-1 text-xs sm:text-sm font-heading cursor-pointer transition-colors ${
                  activeTab === 'data'
                    ? 'text-[#FFD95A] border-b-2 border-[#FFD95A]'
                    : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
                }`}
              >
                Game Data & Demo
              </button>
            </div>

            {/* Tab 1: Profile & Persona */}
            {activeTab === 'profile' && (
              <div className="space-y-4 font-sans text-xs sm:text-sm">
                {/* Career Path Switcher */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#FFD95A] uppercase tracking-wider block">
                    Career Track
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(['corporate', 'business', 'freelancer'] as CareerPath[]).map((path) => (
                      <button
                        key={path}
                        type="button"
                        onClick={() => setCareerPath(path)}
                        className={`p-2.5 border text-left cursor-pointer transition-colors ${
                          profile?.path === path
                            ? 'border-[#FFD95A] bg-[#382E25]'
                            : 'border-[#4B515A] bg-[#2E333B] hover:border-[#FFF4D6]'
                        }`}
                      >
                        <span className="font-bold text-[#FFD95A] uppercase block text-xs">
                          {path}
                        </span>
                        <span className="text-[11px] text-[#B4BAC4] block mt-0.5">
                          {path === 'corporate'
                            ? 'Clerk ➔ Manager ➔ CEO'
                            : path === 'business'
                            ? 'Stall ➔ Merchant ➔ Tycoon'
                            : 'Freelancer ➔ Specialist ➔ Mogul'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Avatar Tone Pickers */}
                <div className="space-y-2 pt-2 border-t border-[#4B515A]/60">
                  <span className="text-xs font-bold text-[#FFD95A] uppercase tracking-wider block">
                    Avatar Appearance
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-[#1B1B1F] border border-[#4B515A] flex items-center justify-center">
                      <CharacterSprite
                        hairColor={hair}
                        outfitColor={outfit}
                        mood="happy"
                        size={52}
                        animate={true}
                      />
                    </div>

                    <div className="flex-1 space-y-2 text-xs">
                      <div>
                        <span className="text-[#B4BAC4] block mb-1">Hair Tone</span>
                        <div className="flex flex-wrap gap-2">
                          {AVATAR_PRESETS.hairColors.map((c) => (
                            <button
                              key={c.value}
                              type="button"
                              onClick={() =>
                                updateProfile({
                                  avatar: { hairColor: c.value, outfitColor: outfit },
                                })
                              }
                              className={`w-5 h-5 border cursor-pointer ${
                                hair === c.value ? 'border-[#FFD95A] scale-110' : 'border-[#1B1B1F]'
                              }`}
                              style={{ backgroundColor: c.value }}
                              title={c.label}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[#B4BAC4] block mb-1">Outfit Tone</span>
                        <div className="flex flex-wrap gap-2">
                          {AVATAR_PRESETS.outfitColors.map((c) => (
                            <button
                              key={c.value}
                              type="button"
                              onClick={() =>
                                updateProfile({
                                  avatar: { hairColor: hair, outfitColor: c.value },
                                })
                              }
                              className={`w-5 h-5 border cursor-pointer ${
                                outfit === c.value ? 'border-[#FFD95A] scale-110' : 'border-[#1B1B1F]'
                              }`}
                              style={{ backgroundColor: c.value }}
                              title={c.label}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Automated Recurring Schedules Overview */}
                <div className="space-y-3 pt-2 border-t border-[#4B515A]/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                    <div>
                      <span className="text-xs font-bold text-[#FFD95A] uppercase tracking-wider block">
                        Active Automated Schedules ({state.recurring.length})
                      </span>
                      <span className="text-[11px] text-[#B4BAC4]">
                        Salary runs via Work. Subscriptions & bills run via Market.
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/work"
                        className="text-xs text-[#79CE5E] hover:underline font-bold px-2 py-0.5 border border-[#79CE5E]/40 bg-[#79CE5E]/10"
                      >
                        + Salary (Work) →
                      </Link>
                      <Link
                        href="/market"
                        className="text-xs text-[#FFD95A] hover:underline font-bold px-2 py-0.5 border border-[#FFD95A]/40 bg-[#FFD95A]/10"
                      >
                        + Bills (Market) →
                      </Link>
                    </div>
                  </div>

                  {state.recurring.length === 0 ? (
                    <div className="p-3 bg-[#1B1B1F] border border-[#4B515A] text-center space-y-1">
                      <p className="italic text-xs text-[#B4BAC4]">
                        No automated recurring rules active.
                      </p>
                      <p className="text-[11px] text-[#B4BAC4]">
                        Set up a recurring monthly salary in <Link href="/work" className="text-[#79CE5E] underline">Work</Link> or add utility bills/subscriptions in <Link href="/market" className="text-[#FFD95A] underline">Market</Link>.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {displayedRecurring.map((r) => {
                        const isIncome = r.type === 'income';
                        return (
                          <div
                            key={r.id}
                            className="p-2.5 bg-[#2E333B] border border-[#4B515A] flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 border uppercase ${
                                  isIncome
                                    ? 'text-[#79CE5E] border-[#79CE5E]/50 bg-[#79CE5E]/10'
                                    : 'text-[#EE6A5E] border-[#EE6A5E]/50 bg-[#EE6A5E]/10'
                                }`}
                              >
                                {r.frequency} {r.type}
                              </span>
                              <span className="font-mono text-[#FFF4D6] font-bold">
                                ₹{r.amount.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[11px] text-[#B4BAC4]">
                                {isIncome ? '(Managed at Work)' : '(Managed at Market)'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleRecurring(r.id)}
                                className={`text-[11px] px-2 py-0.5 border cursor-pointer font-bold ${
                                  r.active
                                    ? 'text-[#79CE5E] border-[#79CE5E]/50 bg-[#79CE5E]/10'
                                    : 'text-[#EE6A5E] border-[#EE6A5E]/50 bg-[#EE6A5E]/10'
                                }`}
                              >
                                {r.active ? 'Active' : 'Paused'}
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteRecurring(r.id)}
                                className="text-xs text-[#EE6A5E] hover:underline cursor-pointer px-1"
                                title="Delete schedule"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {state.recurring.length > 3 && (
                        <div className="pt-1 text-center">
                          <button
                            type="button"
                            onClick={() => setShowAllRecurring(!showAllRecurring)}
                            className="text-xs text-[#D4A373] hover:text-[#FFD95A] underline cursor-pointer"
                          >
                            {showAllRecurring ? 'Show latest 3' : `See all (${state.recurring.length})`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Exactly One Primary Action Button per screen in solid gold */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="w-full"
                  >
                    <PixelButton variant="primary" size="md" fullWidth>
                      Return to Town Map
                    </PixelButton>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Game Data & Demo */}
            {activeTab === 'data' && (
              <div className="space-y-4 font-sans text-xs sm:text-sm">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#FFD95A] uppercase tracking-wider block">
                    Hackathon Demo State
                  </span>
                  <p className="text-xs text-[#B4BAC4] leading-relaxed">
                    Populates Hustle with 3 months of salary history, expense logs across diverse categories, and an active loan to demonstrate all rules.
                  </p>
                  <div>
                    <PixelButton
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={() => {
                        loadDemo();
                        router.push('/');
                      }}
                    >
                      Load Demo State
                    </PixelButton>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#4B515A]/60 space-y-2">
                  <span className="text-xs font-bold text-[#EE6A5E] uppercase tracking-wider block">
                    Reset Game Data
                  </span>
                  <p className="text-xs text-[#B4BAC4] leading-relaxed">
                    Clears all stored transactions, goals, and profile data from local storage.
                  </p>

                  {confirmReset ? (
                    <div className="p-3 bg-[#3A2222] border border-[#EE6A5E] space-y-2">
                      <p className="text-xs text-[#FFF4D6]">
                        Are you sure? All progress will be wiped.
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleResetConfirm}
                          className="text-xs text-[#EE6A5E] font-bold underline cursor-pointer"
                        >
                          Confirm Reset
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmReset(false)}
                          className="text-xs text-[#B4BAC4] underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmReset(true)}
                      className="text-xs text-[#EE6A5E] hover:underline cursor-pointer"
                    >
                      Reset All Data ➔
                    </button>
                  )}
                </div>
              </div>
            )}
          </StonePanel>
        </WoodFrame>

        {/* 96px Bottom RPG Dialogue Text Box */}
        <div className="w-full mt-auto">
          <RpgTextBox />
        </div>
      </div>
    </div>
  );
}
