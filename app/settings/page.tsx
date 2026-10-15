'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { WoodFrame } from '@/components/ui/WoodFrame';
import { StonePanel } from '@/components/ui/StonePanel';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelInput } from '@/components/ui/PixelInput';
import { PixelSelect } from '@/components/ui/PixelSelect';
import { CharacterSprite } from '@/components/ui/CharacterSprite';
import { RpgTextBox } from '@/components/ui/RpgTextBox';
import { HudBar } from '@/components/ui/HudBar';
import { AVATAR_PRESETS } from '@/lib/constants';
import { CareerPath, Frequency, TransactionType } from '@/lib/types';
import { getTodayISO } from '@/lib/rules';

export default function SettingsPage() {
  const router = useRouter();
  const {
    state,
    setCareerPath,
    updateProfile,
    loadDemo,
    resetAll,
    addRecurring,
    toggleRecurring,
    deleteRecurring,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'profile' | 'data'>('profile');
  const [confirmReset, setConfirmReset] = useState(false);
  const [showAllRecurring, setShowAllRecurring] = useState(false);

  // Recurring form state
  const [showAddRec, setShowAddRec] = useState(false);
  const [recType, setRecType] = useState<TransactionType>('expense');
  const [recFreq, setRecFreq] = useState<Frequency>('monthly');
  const [recAmount, setRecAmount] = useState('');

  const profile = state.profile;
  const hair = profile?.avatar.hairColor || AVATAR_PRESETS.hairColors[0].value;
  const outfit = profile?.avatar.outfitColor || AVATAR_PRESETS.outfitColors[0].value;

  const handleAddRecurringSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(recAmount);
    if (isNaN(val) || val <= 0) return;

    addRecurring({
      type: recType,
      frequency: recFreq,
      categoryId: recType === 'income' ? 'cat_salary' : (state.categories[0]?.id || 'cat_food'),
      tag: 'need',
      amount: val,
      startDate: getTodayISO(),
    });

    setRecAmount('');
    setShowAddRec(false);
  };

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

                {/* Recurring Rules Strip (last 3 items + See all link) */}
                <div className="space-y-2 pt-2 border-t border-[#4B515A]/60">
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-xs font-bold text-[#FFD95A] uppercase tracking-wider">
                      Automated Recurring Rules
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddRec(!showAddRec)}
                      className="text-xs text-[#D4A373] hover:text-[#FFD95A] underline cursor-pointer"
                    >
                      {showAddRec ? 'Cancel' : '+ Add rule'}
                    </button>
                  </div>

                  {showAddRec && (
                    <form onSubmit={handleAddRecurringSubmit} className="space-y-3 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <PixelSelect
                          label="Type"
                          value={recType}
                          onChange={(e) => setRecType(e.target.value as TransactionType)}
                          options={[
                            { value: 'income', label: 'Income (+₹)' },
                            { value: 'expense', label: 'Expense (-₹)' },
                          ]}
                        />
                        <PixelSelect
                          label="Frequency"
                          value={recFreq}
                          onChange={(e) => setRecFreq(e.target.value as Frequency)}
                          options={[
                            { value: 'daily', label: 'Daily' },
                            { value: 'weekly', label: 'Weekly' },
                            { value: 'monthly', label: 'Monthly' },
                          ]}
                        />
                        <PixelInput
                          label="Amount (₹)"
                          type="number"
                          min="1"
                          placeholder="e.g. 5000"
                          value={recAmount}
                          onChange={(e) => setRecAmount(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="text-xs text-[#FFD95A] hover:underline font-bold cursor-pointer"
                        >
                          Save Rule
                        </button>
                      </div>
                    </form>
                  )}

                  {state.recurring.length === 0 ? (
                    <p className="text-center italic py-2 text-xs text-[#B4BAC4]">
                      No automated recurring entries active.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {displayedRecurring.map((r) => (
                        <div
                          key={r.id}
                          className="p-2 bg-[#2E333B] border border-[#4B515A] flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[#FFD95A] font-bold uppercase">{r.frequency} {r.type}</span>
                            <span className="font-mono text-[#FFF4D6]">₹{r.amount.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleRecurring(r.id)}
                              className={`text-xs underline cursor-pointer ${r.active ? 'text-[#79CE5E]' : 'text-[#EE6A5E]'}`}
                            >
                              {r.active ? 'Active' : 'Paused'}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteRecurring(r.id)}
                              className="text-xs text-[#EE6A5E] hover:underline cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}

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
