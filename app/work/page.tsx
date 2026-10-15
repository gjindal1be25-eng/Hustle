'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { WoodFrame } from '@/components/ui/WoodFrame';
import { StonePanel } from '@/components/ui/StonePanel';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelInput } from '@/components/ui/PixelInput';
import { PixelSelect } from '@/components/ui/PixelSelect';
import { RpgTextBox } from '@/components/ui/RpgTextBox';
import { HudBar } from '@/components/ui/HudBar';
import { LEVEL_THRESHOLDS, CAREER_TITLES } from '@/lib/constants';
import { getTodayISO } from '@/lib/rules';
import { Frequency } from '@/lib/types';

const INCOME_CATEGORIES = [
  { id: 'cat_salary', label: 'Salary / Wage' },
  { id: 'cat_freelance', label: 'Freelance' },
  { id: 'cat_business_rev', label: 'Business' },
  { id: 'cat_bonus', label: 'Bonus' },
  { id: 'cat_other_inc', label: 'Other Inflow' },
];

export default function WorkPage() {
  const {
    state,
    level,
    levelTitle,
    savedMonths,
    logTransaction,
    deleteTransaction,
    addRecurring,
    toggleRecurring,
    deleteRecurring,
    updateLastSeenLevel,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'log' | 'history'>('log');
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (level > (state.meta.lastSeenLevel || 1)) {
      updateLastSeenLevel(level);
    }
  }, [level, state.meta.lastSeenLevel, updateLastSeenLevel]);

  // Form states
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayISO());
  const [categoryName, setCategoryName] = useState<string>('cat_salary');
  const [note, setNote] = useState<string>('');

  // Recurring form state
  const [showAddRec, setShowAddRec] = useState(false);
  const [recAmount, setRecAmount] = useState<string>('');
  const [recFreq, setRecFreq] = useState<Frequency>('monthly');

  const path = state.profile?.path || 'corporate';
  const incomes = state.transactions.filter((t) => t.type === 'income');
  const recurringIncomes = state.recurring.filter((r) => r.type === 'income');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    const success = logTransaction({
      type: 'income',
      categoryId: categoryName,
      amount: val,
      date,
      note: note.trim() || 'Work earnings',
    });

    if (success) {
      setAmount('');
      setNote('');
      setShowAdvanced(false);
    }
  };

  const handleAddRecurring = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(recAmount);
    if (isNaN(val) || val <= 0) return;

    addRecurring({
      type: 'income',
      categoryId: 'cat_salary',
      amount: val,
      frequency: recFreq,
      startDate: getTodayISO(),
    });

    setRecAmount('');
    setShowAddRec(false);
  };

  const displayedIncomes = showAllHistory ? incomes : incomes.slice(0, 3);

  // Career level progress calculation
  const minSaved = Math.max(0, LEVEL_THRESHOLDS[level - 1]?.minSavedMonths ?? 0);
  const targetSaved = LEVEL_THRESHOLDS[level]?.minSavedMonths ?? 1;
  const currentSaved = Math.max(0, savedMonths);
  const progressRatio = level < 5 ? (currentSaved - minSaved) / Math.max(0.1, targetSaved - minSaved) : 1;
  const progressPct = Math.min(100, Math.max(5, Math.round(progressRatio * 100)));

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-[#1B1B1F]">
      <HudBar />

      <div className="w-full max-w-[720px] px-3 sm:px-4 py-4 space-y-4 flex-1">
        <WoodFrame
          title="WORKPLACE & CAREER"
          subtitle="Log earnings, boost net savings, and advance your career rank"
        >
          {/* Single Calm Stone Panel with Gold Tab Underline */}
          <StonePanel className="space-y-4">
            {/* Tabs with Gold Underline */}
            <div className="flex border-b border-[#4B515A] gap-6 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('log')}
                className={`pb-1 text-xs sm:text-sm font-heading cursor-pointer transition-colors ${
                  activeTab === 'log'
                    ? 'text-[#FFD95A] border-b-2 border-[#FFD95A]'
                    : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
                }`}
              >
                Log Income
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`pb-1 text-xs sm:text-sm font-heading cursor-pointer transition-colors ${
                  activeTab === 'history'
                    ? 'text-[#FFD95A] border-b-2 border-[#FFD95A]'
                    : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
                }`}
              >
                History & Recurring ({incomes.length})
              </button>
            </div>

            {/* Tab 1: Option C 2-Step Quick-Add Flow */}
            {activeTab === 'log' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Step 1: Amount */}
                <div className="space-y-1.5">
                  <label className="text-xs font-sans uppercase tracking-wider text-[#FFD95A] font-bold">
                    Step 1 · Enter Amount (₹)
                  </label>
                  <PixelInput
                    prefix="₹"
                    type="number"
                    min="1"
                    step="50"
                    placeholder="e.g. 35000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                {/* Step 2: Category Chips */}
                <div className="space-y-1.5">
                  <label className="text-xs font-sans uppercase tracking-wider text-[#FFD95A] font-bold">
                    Step 2 · Select Income Source
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INCOME_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryName(cat.id)}
                        className={`px-3 py-1.5 text-xs sm:text-sm font-sans transition-colors cursor-pointer border ${
                          categoryName === cat.id
                            ? 'bg-[#FFD95A] text-[#1B1B1F] font-bold border-[#FFD95A]'
                            : 'bg-[#2E333B] text-[#FFF4D6] border-[#4B515A] hover:border-[#B4BAC4]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advanced Options Disclosure (Date, Note) */}
                <div className="pt-1 border-t border-[#4B515A]/60">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs text-[#D4A373] hover:text-[#FFD95A] underline cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{showAdvanced ? '▼' : '▶'}</span>
                    <span>Advanced options (Date, Note)</span>
                  </button>

                  {showAdvanced && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <PixelInput
                        label="Date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                      />

                      <PixelInput
                        label="Memo / Note"
                        placeholder="e.g. Monthly salary, invoice..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Exactly One Primary Action Button per screen in solid gold */}
                <div className="pt-2">
                  <PixelButton variant="primary" size="md" type="submit" fullWidth>
                    Deposit Income (+₹)
                  </PixelButton>
                </div>

                {/* Career Rank Status Strip (16px spacing, clean, no nested boxes) */}
                <div className="pt-3 border-t border-[#4B515A]/60 space-y-2">
                  <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm">
                    <span className="text-[#FFF4D6]">
                      Rank: <strong className="text-[#FFD95A] font-bold">{levelTitle} (Level {level})</strong>
                    </span>
                    <span className="text-[#B4BAC4]">
                      {level < 5
                        ? `Next: ${CAREER_TITLES[path][level + 1]} (${LEVEL_THRESHOLDS[level].minSavedMonths} mos cushion needed)`
                        : 'Max Rank Reached! 👑'}
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-[#1B1B1F] border border-[#4B515A] overflow-hidden">
                    <div
                      className="h-full bg-[#FFD95A] transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </form>
            )}

            {/* Tab 2: History & Recurring (Last 3 items + See all link) */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {/* Income History List */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center pb-1 border-b border-[#4B515A]/60">
                    <span className="text-xs sm:text-sm font-sans font-bold text-[#FFD95A] uppercase tracking-wider">
                      Recent Income Entries
                    </span>
                    {incomes.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setShowAllHistory(!showAllHistory)}
                        className="text-xs text-[#D4A373] hover:text-[#FFD95A] underline cursor-pointer"
                      >
                        {showAllHistory ? 'Show latest 3' : `See all (${incomes.length})`}
                      </button>
                    )}
                  </div>

                  {incomes.length === 0 ? (
                    <p className="text-center italic py-4 text-xs text-[#B4BAC4]">
                      No income logged yet.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-sans text-xs sm:text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-[#4B515A] text-[#B4BAC4] uppercase text-[11px]">
                            <th className="py-1.5 px-2">Date</th>
                            <th className="py-1.5 px-2">Source</th>
                            <th className="py-1.5 px-2">Note</th>
                            <th className="py-1.5 px-2 text-right">Amount</th>
                            <th className="py-1.5 px-2 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedIncomes.map((inc, idx) => (
                            <tr
                              key={inc.id}
                              className={`border-b border-[#4B515A]/30 ${
                                idx % 2 === 0 ? 'bg-[#3A3F47]' : 'bg-[#32363E]'
                              }`}
                            >
                              <td className="py-2 px-2 text-[#B4BAC4] whitespace-nowrap">{inc.date}</td>
                              <td className="py-2 px-2 text-[#FFF4D6] whitespace-nowrap">
                                {inc.categoryId?.replace('cat_', '').toUpperCase()}
                              </td>
                              <td className="py-2 px-2 text-[#B4BAC4] truncate max-w-[140px]">
                                {inc.note || '—'}
                              </td>
                              <td className="py-2 px-2 text-right font-mono font-bold text-[#79CE5E] whitespace-nowrap">
                                +₹{inc.amount.toLocaleString('en-IN')}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => deleteTransaction(inc.id)}
                                  className="text-xs text-[#EE6A5E] hover:underline cursor-pointer"
                                  title="Delete entry"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Recurring Income Rules */}
                <div className="space-y-2 pt-2 border-t border-[#4B515A]/60">
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-xs sm:text-sm font-sans font-bold text-[#FFD95A] uppercase tracking-wider">
                      Recurring Income Rules
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddRec(!showAddRec)}
                      className="text-xs text-[#D4A373] hover:text-[#FFD95A] underline cursor-pointer"
                    >
                      {showAddRec ? 'Cancel' : '+ Add recurring'}
                    </button>
                  </div>

                  {showAddRec && (
                    <form onSubmit={handleAddRecurring} className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <PixelInput
                          label="Amount (₹)"
                          type="number"
                          prefix="₹"
                          min="1"
                          placeholder="e.g. 35000"
                          value={recAmount}
                          onChange={(e) => setRecAmount(e.target.value)}
                          required
                        />
                        <PixelSelect
                          label="Frequency"
                          value={recFreq}
                          onChange={(e) => setRecFreq(e.target.value as Frequency)}
                          options={[
                            { value: 'monthly', label: 'Monthly' },
                            { value: 'weekly', label: 'Weekly' },
                            { value: 'daily', label: 'Daily' },
                          ]}
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="text-xs text-[#FFD95A] hover:underline font-bold cursor-pointer"
                        >
                          Save Recurring Rule
                        </button>
                      </div>
                    </form>
                  )}

                  {recurringIncomes.length === 0 ? (
                    <p className="text-center italic py-3 text-xs text-[#B4BAC4]">
                      No recurring income rules active.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {recurringIncomes.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between p-2.5 bg-[#2E333B] border border-[#4B515A]"
                        >
                          <div>
                            <span className="font-bold text-[#FFD95A] text-xs sm:text-sm block">
                              +₹{r.amount.toLocaleString('en-IN')} ({r.frequency})
                            </span>
                            <span className="text-[11px] text-[#B4BAC4]">
                              Started {r.startDate} {r.lastPostedDate ? `| Last: ${r.lastPostedDate}` : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleRecurring(r.id)}
                              className={`text-xs underline cursor-pointer ${
                                r.active ? 'text-[#79CE5E]' : 'text-[#EE6A5E]'
                              }`}
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
                    </div>
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
