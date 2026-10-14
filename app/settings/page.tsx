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
import { CareerPath, Frequency, NeedWantTag, TransactionType } from '@/lib/types';
import { getTodayISO } from '@/lib/rules';

export default function SettingsPage() {
  const router = useRouter();
  const {
    state,
    level,
    levelTitle,
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
  const [recCat, setRecCat] = useState(state.categories[0]?.id || 'cat_food');
  const [recTag, setRecTag] = useState<NeedWantTag>('need');
  const [recAmount, setRecAmount] = useState('');
  const [recStart, setRecStart] = useState(getTodayISO());

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
      categoryId: recCat,
      tag: recTag,
      amount: val,
      startDate: recStart,
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
    : state.recurring.slice(0, 5);

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-[#1B1B1F]">
      <HudBar />

      <div className="w-full max-w-[720px] px-3 sm:px-6 py-6 space-y-4 flex-1">
        <WoodFrame
          title="TOWN SETTINGS"
          subtitle="Customize your career path, avatar styling, and game parameters"
        >
          <div className="space-y-4">
            {/* Main Action (top, always visible): Switch Path & Edit Avatar */}
            <StonePanel>
              <div className="space-y-4">
                {/* Career Path Switcher */}
                <div>
                  <span className="font-['VT323'] text-[20px] text-[#FFD95A] block mb-2">
                    Switch Career Path
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(['corporate', 'business', 'freelancer'] as CareerPath[]).map((path) => (
                      <button
                        key={path}
                        type="button"
                        onClick={() => setCareerPath(path)}
                        className={`p-2.5 border-2 text-left cursor-pointer transition-all ${
                          profile?.path === path
                            ? 'border-[#FFD95A] bg-[#382E25]'
                            : 'border-[#4B515A] bg-[#2E333B] hover:border-[#FFF4D6]'
                        }`}
                      >
                        <span className="font-['VT323'] text-[20px] text-[#FFD95A] uppercase block">
                          {path}
                        </span>
                        <span className="font-['VT323'] text-[16px] text-[#FFF4D6]/70 block">
                          {path === 'corporate'
                            ? 'Clerk ➔ Manager ➔ CEO'
                            : path === 'business'
                            ? 'Stall ➔ Shopkeeper ➔ Tycoon'
                            : 'Freelancer ➔ Specialist ➔ Mogul'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Avatar Styling */}
                <div className="pt-3 border-t border-[#4B515A]">
                  <span className="font-['VT323'] text-[20px] text-[#FFD95A] block mb-2">
                    Edit Character Avatar
                  </span>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="p-3 bg-[#1B1B1F] border border-[#4B515A] flex items-center justify-center">
                      <CharacterSprite
                        hairColor={hair}
                        outfitColor={outfit}
                        mood="happy"
                        size={64}
                        animate={true}
                      />
                    </div>

                    <div className="flex-1 space-y-3 font-['VT323']">
                      <div>
                        <span className="text-[18px] text-[#FFF4D6] block mb-1">
                          Hair Tone
                        </span>
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
                              className={`w-6 h-6 border-2 cursor-pointer ${
                                hair === c.value
                                  ? 'border-[#FFD95A] scale-110'
                                  : 'border-[#1B1B1F]'
                              }`}
                              style={{ backgroundColor: c.value }}
                              title={c.label}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[18px] text-[#FFF4D6] block mb-1">
                          Outfit Tone
                        </span>
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
                              className={`w-6 h-6 border-2 cursor-pointer ${
                                outfit === c.value
                                  ? 'border-[#FFD95A] scale-110'
                                  : 'border-[#1B1B1F]'
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
              </div>
            </StonePanel>

            {/* Two Tabs: Profile & Data */}
            <div className="flex border-b-2 border-[#4B515A] gap-2 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 font-['Press_Start_2P'] text-[14px] cursor-pointer transition-colors border-2 ${
                  activeTab === 'profile'
                    ? 'bg-[#382E25] text-[#FFD95A] border-[#FFD95A]'
                    : 'bg-[#2A231D] text-[#FFF4D6] border-[#54433A] hover:bg-[#382E25]'
                }`}
              >
                Profile
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('data')}
                className={`px-4 py-2 font-['Press_Start_2P'] text-[14px] cursor-pointer transition-colors border-2 ${
                  activeTab === 'data'
                    ? 'bg-[#382E25] text-[#FFD95A] border-[#FFD95A]'
                    : 'bg-[#2A231D] text-[#FFF4D6] border-[#54433A] hover:bg-[#382E25]'
                }`}
              >
                Data
              </button>
            </div>

            {/* Tab 1: Profile */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                {/* Profile Details Panel */}
                <StonePanel>
                  <span className="font-['VT323'] text-[20px] text-[#FFD95A] block mb-2">
                    Hero Standing & Persona
                  </span>
                  <div className="grid grid-cols-2 gap-3 font-['VT323'] text-[18px]">
                    <div className="p-2 bg-[#2E333B] border border-[#4B515A]">
                      <span className="text-[#FFF4D6]/70 block">NAME</span>
                      <span className="text-[#FFF4D6] text-[20px]">{profile?.name || 'Hero'}</span>
                    </div>
                    <div className="p-2 bg-[#2E333B] border border-[#4B515A]">
                      <span className="text-[#FFF4D6]/70 block">CAREER TITLE</span>
                      <span className="text-[#FFD95A] text-[20px]">{levelTitle} (Level {level})</span>
                    </div>
                  </div>
                </StonePanel>

                {/* Recurring Automation Rules */}
                <StonePanel>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-['VT323'] text-[20px] text-[#FFD95A]">
                      Recurring Automation Rules
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddRec(!showAddRec)}
                      className="font-['VT323'] text-[18px] text-[#FFD95A] underline hover:text-[#FFE885] cursor-pointer"
                    >
                      {showAddRec ? 'Close form' : '+ New rule'}
                    </button>
                  </div>

                  {showAddRec && (
                    <form
                      onSubmit={handleAddRecurringSubmit}
                      className="p-3 bg-[#2E333B] border border-[#4B515A] space-y-3 mb-3"
                    >
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

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <PixelSelect
                          label="Category"
                          value={recCat}
                          onChange={(e) => {
                            setRecCat(e.target.value);
                            const cat = state.categories.find((c) => c.id === e.target.value);
                            if (cat) setRecTag(cat.defaultTag);
                          }}
                          options={state.categories.map((c) => ({
                            value: c.id,
                            label: `${c.name} (${c.defaultTag.toUpperCase()})`,
                          }))}
                        />
                        {recType === 'expense' ? (
                          <PixelSelect
                            label="Tag"
                            value={recTag}
                            onChange={(e) => setRecTag(e.target.value as NeedWantTag)}
                            options={[
                              { value: 'need', label: 'Need' },
                              { value: 'want', label: 'Want' },
                            ]}
                          />
                        ) : (
                          <div className="flex flex-col justify-end text-[16px] font-['VT323'] text-[#FFF4D6]/70 pb-2">
                            <span>Income credit rule</span>
                          </div>
                        )}
                        <PixelInput
                          label="Start Date"
                          type="date"
                          value={recStart}
                          onChange={(e) => setRecStart(e.target.value)}
                          required
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <PixelButton
                          variant="wood"
                          type="button"
                          onClick={() => setShowAddRec(false)}
                        >
                          Cancel
                        </PixelButton>
                        <PixelButton variant="primary" type="submit">
                          Save Rule
                        </PixelButton>
                      </div>
                    </form>
                  )}

                  {state.recurring.length === 0 ? (
                    <p className="font-['VT323'] text-[18px] text-[#FFF4D6]/70 italic">
                      No automated recurring entries active.
                    </p>
                  ) : (
                    <div className="space-y-1.5 font-['VT323']">
                      {displayedRecurring.map((r) => (
                        <div
                          key={r.id}
                          className="p-2 bg-[#2E333B] border border-[#4B515A] flex items-center justify-between text-[18px]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[#FFD95A] uppercase">{r.frequency} {r.type}</span>
                            <span className="text-[#FFF4D6]">₹{r.amount.toLocaleString('en-IN')}</span>
                            <span className="text-[#FFF4D6]/70">({r.startDate})</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleRecurring(r.id)}
                              className={`underline cursor-pointer ${r.active ? 'text-[#79CE5E]' : 'text-[#EE6A5E]'}`}
                            >
                              {r.active ? 'Active' : 'Paused'}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteRecurring(r.id)}
                              className="text-[#EE6A5E] cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}

                      {state.recurring.length > 5 && (
                        <div className="pt-2 text-center">
                          <button
                            type="button"
                            onClick={() => setShowAllRecurring(!showAllRecurring)}
                            className="font-['VT323'] text-[18px] text-[#FFD95A] underline hover:text-[#FFE885] cursor-pointer"
                          >
                            {showAllRecurring ? 'Show less' : `Show all (${state.recurring.length} rules)`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </StonePanel>
              </div>
            )}

            {/* Tab 2: Data (demo, reset) */}
            {activeTab === 'data' && (
              <div className="space-y-4">
                {/* Hackathon Judge Demo Loader */}
                <StonePanel>
                  <div className="space-y-3 font-['VT323']">
                    <span className="text-[20px] text-[#FFD95A] block">
                      Hackathon Judge Demo State
                    </span>
                    <p className="text-[18px] text-[#FFF4D6]/80 leading-normal">
                      Populates the town with 3 full months of salary deposits, diverse expense logs, an active loan, and an established Level 2 Clerk town.
                    </p>
                    <PixelButton
                      variant="primary"
                      onClick={() => {
                        loadDemo();
                        router.push('/');
                      }}
                    >
                      Load Demo State
                    </PixelButton>
                  </div>
                </StonePanel>

                {/* Reset All Game Data - Placed Last on Data tab */}
                <StonePanel>
                  <div className="space-y-3 font-['VT323']">
                    <span className="text-[20px] text-[#EE6A5E] block">
                      Reset All Town Data
                    </span>
                    <p className="text-[18px] text-[#FFF4D6]/80 leading-normal">
                      Wipes all local state, reset transactions, goals, and history back to the initial opening screen.
                    </p>

                    {confirmReset ? (
                      <div className="p-3 bg-[#3A2222] border-2 border-[#EE6A5E] space-y-3">
                        <p className="text-[18px] text-[#FFF4D6]">
                          Are you sure you want to erase all progress? This action cannot be reversed.
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={handleResetConfirm}
                            className="px-4 py-2 font-['VT323'] text-[20px] bg-[#8B2626] hover:bg-[#A83232] text-white border-2 border-[#541818] cursor-pointer"
                          >
                            Confirm Reset
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmReset(false)}
                            className="px-4 py-2 font-['VT323'] text-[20px] bg-[#2E333B] text-[#FFF4D6] border-2 border-[#4B515A] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmReset(true)}
                        className="px-4 py-2 font-['VT323'] text-[20px] bg-[#8B2626] hover:bg-[#A83232] text-white border-2 border-[#541818] cursor-pointer"
                      >
                        Reset All Data
                      </button>
                    )}
                  </div>
                </StonePanel>
              </div>
            )}
          </div>
        </WoodFrame>

        {/* 96px Bottom RPG Dialogue Text Box */}
        <div className="w-full mt-auto">
          <RpgTextBox />
        </div>
      </div>
    </div>
  );
}
