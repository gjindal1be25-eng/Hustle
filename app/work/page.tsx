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

  const [activeTab, setActiveTab] = useState<'log' | 'recurring'>('log');
  const [showAllHistory, setShowAllHistory] = useState(false);

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

  const displayedIncomes = showAllHistory ? incomes : incomes.slice(0, 5);

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-[#1B1B1F]">
      <HudBar />

      <div className="w-full max-w-[720px] px-3 sm:px-4 py-4 space-y-4 flex-1">
        <WoodFrame
          title="WORKPLACE & CAREER"
          subtitle="Log earnings, boost net savings, and climb the professional ladder"
        >
          <div className="space-y-4">
            {/* Main Action (top, always visible): Log Income Form */}
            <StonePanel title="Log Income (+₹)">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <PixelInput
                    label="Amount (₹)"
                    prefix="₹"
                    type="number"
                    min="1"
                    step="50"
                    placeholder="e.g. 35000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />

                  <PixelInput
                    label="Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />

                  <PixelSelect
                    label="Income Source"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    options={[
                      { value: 'cat_salary', label: 'Primary Salary / Wage' },
                      { value: 'cat_freelance', label: 'Freelance / Side Gig' },
                      { value: 'cat_business_rev', label: 'Business Revenue' },
                      { value: 'cat_bonus', label: 'Bonus / Incentive' },
                      { value: 'cat_other_inc', label: 'Other Inflow' },
                    ]}
                  />

                  <PixelInput
                    label="Memo / Note"
                    placeholder="e.g. Monthly salary, Client invoice..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <PixelButton variant="primary" size="md" type="submit">
                    Deposit Income (+₹)
                  </PixelButton>
                </div>
              </form>
            </StonePanel>

            {/* Two Tabs: Tab 1: Log, Tab 2: Recurring (P1) */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('log')}
                className={`px-4 py-2 text-[14px] font-heading cursor-pointer transition-colors ${
                  activeTab === 'log'
                    ? 'bg-[#8B5E34] text-[#FFD95A] border-2 border-[#D9A05E]'
                    : 'bg-[#5C3826] text-[#FFF4D6] border-2 border-[#8B5E34] hover:bg-[#6E442F]'
                }`}
              >
                Log History
              </button>
              <button
                onClick={() => setActiveTab('recurring')}
                className={`px-4 py-2 text-[14px] font-heading cursor-pointer transition-colors ${
                  activeTab === 'recurring'
                    ? 'bg-[#8B5E34] text-[#FFD95A] border-2 border-[#D9A05E]'
                    : 'bg-[#5C3826] text-[#FFF4D6] border-2 border-[#8B5E34] hover:bg-[#6E442F]'
                }`}
              >
                Recurring (P1)
              </button>
            </div>

            {/* Tab 1 Content: Log History & Career Status */}
            {activeTab === 'log' && (
              <div className="space-y-4">
                {/* Career Status Strip */}
                <StonePanel title={`Rank: ${levelTitle} (Level ${level})`}>
                  <div className="space-y-2 text-[20px]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span>
                        Buffer: <strong className="text-[#FFD95A]">{savedMonths} months</strong> saved
                      </span>
                      <span className="text-[#B4BAC4]">
                        {level < 5
                          ? `Next: ${CAREER_TITLES[path][level + 1]} (${LEVEL_THRESHOLDS[level].minSavedMonths} mos needed)`
                          : 'Max Rank Reached! 👑'}
                      </span>
                    </div>

                    {/* Level Progress Bar */}
                    {(() => {
                      const minSaved = Math.max(0, LEVEL_THRESHOLDS[level - 1]?.minSavedMonths ?? 0);
                      const targetSaved = LEVEL_THRESHOLDS[level]?.minSavedMonths ?? 1;
                      const currentSaved = Math.max(0, savedMonths);
                      const progressRatio = level < 5 ? (currentSaved - minSaved) / Math.max(0.1, targetSaved - minSaved) : 1;
                      const progressPct = Math.min(100, Math.max(5, Math.round(progressRatio * 100)));
                      return (
                        <div className="w-full h-3 bg-[#1B1B1F] border border-[#4B515A] overflow-hidden">
                          <div
                            className="h-full bg-[#FFD95A] transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      );
                    })()}
                  </div>
                </StonePanel>

                {/* Latest 5 rows with "Show all" text button */}
                <StonePanel title={`Income History (${incomes.length} Entries)`}>
                  {incomes.length === 0 ? (
                    <p className="text-center italic py-2 text-[#B4BAC4]">
                      No income logged yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-body text-[20px] border-collapse">
                          <thead>
                            <tr className="border-b border-[#4B515A] text-[#FFD95A] font-heading text-[12px] uppercase">
                              <th className="py-1 px-2">Date</th>
                              <th className="py-1 px-2">Source</th>
                              <th className="py-1 px-2">Note</th>
                              <th className="py-1 px-2 text-right">Amount</th>
                              <th className="py-1 px-2 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayedIncomes.map((inc, idx) => (
                              <tr
                                key={inc.id}
                                className={`border-b border-[#4B515A]/40 ${
                                  idx % 2 === 0 ? 'bg-[#3A3F47]' : 'bg-[#333840]'
                                }`}
                              >
                                <td className="py-1.5 px-2 text-[#B4BAC4]">{inc.date}</td>
                                <td className="py-1.5 px-2">{inc.categoryId?.replace('cat_', '').toUpperCase()}</td>
                                <td className="py-1.5 px-2 text-[#B4BAC4] truncate max-w-[140px]">{inc.note || '—'}</td>
                                <td className="py-1.5 px-2 text-right text-[#79CE5E]">+₹{inc.amount.toLocaleString('en-IN')}</td>
                                <td className="py-1.5 px-2 text-center">
                                  <button
                                    onClick={() => deleteTransaction(inc.id)}
                                    className="text-xs text-[#EE6A5E] hover:underline cursor-pointer"
                                    title="Delete entry"
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {incomes.length > 5 && (
                        <div className="text-center pt-1">
                          <button
                            onClick={() => setShowAllHistory(!showAllHistory)}
                            className="text-[14px] text-[#FFD95A] hover:underline cursor-pointer"
                          >
                            {showAllHistory ? 'Show latest 5' : `Show all (${incomes.length})`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </StonePanel>
              </div>
            )}

            {/* Tab 2 Content: Recurring (P1) */}
            {activeTab === 'recurring' && (
              <StonePanel title="Recurring Incomes">
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-[#4B515A]">
                    <span className="text-[#B4BAC4]">Automate recurring salary or revenue.</span>
                    <PixelButton
                      variant="wood"
                      size="sm"
                      onClick={() => setShowAddRec(!showAddRec)}
                    >
                      {showAddRec ? 'Cancel' : '+ New Recurring'}
                    </PixelButton>
                  </div>

                  {showAddRec && (
                    <form onSubmit={handleAddRecurring} className="p-3 bg-[#2E333B] border border-[#4B515A] space-y-3">
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
                        <PixelButton variant="primary" size="sm" type="submit">
                          Save Recurring
                        </PixelButton>
                      </div>
                    </form>
                  )}

                  {recurringIncomes.length === 0 ? (
                    <p className="text-center italic py-2 text-[#B4BAC4]">
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
                            <strong className="text-[#FFD95A] block">
                              +₹{r.amount.toLocaleString('en-IN')} ({r.frequency})
                            </strong>
                            <span className="text-xs text-[#B4BAC4]">
                              Started {r.startDate} {r.lastPostedDate ? `| Last: ${r.lastPostedDate}` : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleRecurring(r.id)}
                              className={`text-[12px] px-2 py-0.5 border cursor-pointer ${
                                r.active ? 'border-[#79CE5E] text-[#79CE5E]' : 'border-[#EE6A5E] text-[#EE6A5E]'
                              }`}
                            >
                              {r.active ? 'Active' : 'Paused'}
                            </button>
                            <button
                              onClick={() => deleteRecurring(r.id)}
                              className="text-xs text-[#EE6A5E] hover:underline cursor-pointer ml-1"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </StonePanel>
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
