'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import { WoodFrame } from '@/components/ui/WoodFrame';
import { StonePanel } from '@/components/ui/StonePanel';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelInput } from '@/components/ui/PixelInput';
import { PixelSelect } from '@/components/ui/PixelSelect';
import { RpgTextBox } from '@/components/ui/RpgTextBox';
import { HudBar } from '@/components/ui/HudBar';
import { getTodayISO } from '@/lib/rules';
import { NeedWantTag } from '@/lib/types';
import { NEEDS_WANTS_ITEMS, NeedsWantsItem } from '@/lib/gameplay';
import { playButtonSound, playCoinSound, playFanfareSound, playWarningSound } from '@/lib/sound';

export default function MarketPage() {
  const {
    state,
    budgetStatuses,
    logTransaction,
    deleteTransaction,
    addCategory,
    updateCategoryLimit,
    renameCategory,
    deleteCategory,
    addRenown,
    addRecurring,
    toggleRecurring,
    deleteRecurring,
    recordBuildingVisit,
  } = useGame();

  useEffect(() => {
    recordBuildingVisit('market');
  }, [recordBuildingVisit]);

  const [activeTab, setActiveTab] = useState<'log' | 'budgets' | 'blitz' | 'recurring'>('log');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Recurring form state
  const [showAddRec, setShowAddRec] = useState(false);
  const [recAmount, setRecAmount] = useState('');
  const [recCategoryId, setRecCategoryId] = useState('cat_rent');
  const [recFreq, setRecFreq] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [recTag, setRecTag] = useState<NeedWantTag>('need');

  // Blitz Mini-game State
  const [blitzPlaying, setBlitzPlaying] = useState(false);
  const [blitzTimeLeft, setBlitzTimeLeft] = useState(25);
  const [blitzScore, setBlitzScore] = useState(0);
  const [blitzStreak, setBlitzStreak] = useState(0);
  const [blitzMaxStreak, setBlitzMaxStreak] = useState(0);
  const [blitzItemIdx, setBlitzItemIdx] = useState(0);
  const [blitzFeedback, setBlitzFeedback] = useState<{ text: string; correct: boolean } | null>(null);
  const [blitzFinished, setBlitzFinished] = useState(false);
  const [blitzShuffledItems, setBlitzShuffledItems] = useState<NeedsWantsItem[]>(NEEDS_WANTS_ITEMS);
  const rewardedBlitzRef = useRef(false);

  const blitzRenownEarned =
    blitzFinished && blitzScore > 0
      ? Math.max(10, Math.round(blitzScore / 4) + blitzMaxStreak * 2)
      : 0;

  // Form states
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayISO());
  const [categoryId, setCategoryId] = useState<string>(
    state.categories[0]?.id || 'cat_food'
  );
  const [tag, setTag] = useState<NeedWantTag>('need');
  const [note, setNote] = useState<string>('');

  // Add custom category state
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatTag, setNewCatTag] = useState<NeedWantTag>('want');
  const [newCatLimit, setNewCatLimit] = useState('');

  // Edit limit & rename state
  const [editingLimitId, setEditingLimitId] = useState<string | null>(null);
  const [limitInput, setLimitInput] = useState<string>('');
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState<string>('');

  const expenses = state.transactions.filter((t) => t.type === 'expense');
  const recurringExpenses = state.recurring.filter((r) => r.type === 'expense');

  const handleAddRecurringExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(recAmount);
    if (isNaN(val) || val <= 0) return;

    addRecurring({
      type: 'expense',
      categoryId: recCategoryId,
      tag: recTag,
      amount: val,
      frequency: recFreq,
      startDate: getTodayISO(),
    });

    setRecAmount('');
    setShowAddRec(false);
  };

  const handleCategorySelect = (id: string) => {
    setCategoryId(id);
    const cat = state.categories.find((c) => c.id === id);
    if (cat) {
      setTag(cat.defaultTag);
    }
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    const success = logTransaction({
      type: 'expense',
      categoryId,
      tag,
      amount: val,
      date,
      note: note.trim() || 'Market expense',
    });

    if (success) {
      setAmount('');
      setNote('');
      setShowAdvanced(false);
    }
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const limit = newCatLimit ? parseFloat(newCatLimit) : undefined;
    addCategory(newCatName.trim(), newCatTag, limit);
    setNewCatName('');
    setNewCatLimit('');
    setShowAddCat(false);
  };

  const handleSaveLimit = (catId: string) => {
    const val = limitInput ? parseFloat(limitInput) : undefined;
    updateCategoryLimit(catId, val);
    setEditingLimitId(null);
  };

  const handleSaveName = (catId: string) => {
    if (!nameInput.trim()) return;
    renameCategory(catId, nameInput.trim());
    setEditingNameId(null);
  };

  // Blitz 25s Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (blitzPlaying && blitzTimeLeft > 0) {
      timer = setInterval(() => {
        setBlitzTimeLeft((t) => {
          if (t <= 1) {
            setBlitzPlaying(false);
            setBlitzFinished(true);
            playFanfareSound();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [blitzPlaying, blitzTimeLeft]);

  // When blitz finishes, calculate and award renown once
  useEffect(() => {
    if (blitzFinished && blitzScore > 0 && !rewardedBlitzRef.current) {
      rewardedBlitzRef.current = true;
      const reward = Math.max(10, Math.round(blitzScore / 4) + blitzMaxStreak * 2);
      addRenown(reward, 'Needs vs Wants Blitz');
    }
    if (!blitzFinished) {
      rewardedBlitzRef.current = false;
    }
  }, [blitzFinished, blitzScore, blitzMaxStreak, addRenown]);

  const startBlitz = () => {
    const shuffled = [...NEEDS_WANTS_ITEMS].sort(() => Math.random() - 0.5);
    setBlitzShuffledItems(shuffled);
    setBlitzItemIdx(0);
    setBlitzScore(0);
    setBlitzStreak(0);
    setBlitzMaxStreak(0);
    setBlitzFeedback(null);
    setBlitzTimeLeft(25);
    setBlitzFinished(false);
    setBlitzPlaying(true);
    playButtonSound();
  };

  const handleBlitzChoice = (choice: 'need' | 'want') => {
    if (!blitzPlaying) return;
    const currentItem = blitzShuffledItems[blitzItemIdx];
    const isCorrect = currentItem.type === choice;
    if (isCorrect) {
      playCoinSound();
      const newStreak = blitzStreak + 1;
      const points = 10 * Math.min(newStreak, 4);
      setBlitzScore((s) => s + points);
      setBlitzStreak(newStreak);
      setBlitzMaxStreak((m) => Math.max(m, newStreak));
      setBlitzFeedback({
        text: `+${points} pts! ${currentItem.name} is a ${choice.toUpperCase()}!`,
        correct: true,
      });
    } else {
      playWarningSound();
      setBlitzStreak(0);
      setBlitzFeedback({
        text: `Oops! ${currentItem.name} is a ${currentItem.type.toUpperCase()}!`,
        correct: false,
      });
    }
    setTimeout(() => {
      setBlitzFeedback(null);
      if (blitzItemIdx + 1 < blitzShuffledItems.length) {
        setBlitzItemIdx((i) => i + 1);
      } else {
        setBlitzShuffledItems([...NEEDS_WANTS_ITEMS].sort(() => Math.random() - 0.5));
        setBlitzItemIdx(0);
      }
    }, 450);
  };

  const displayedExpenses = showAllHistory ? expenses : expenses.slice(0, 3);

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-[#1B1B1F]">
      <HudBar />

      <div className="w-full max-w-[720px] px-3 sm:px-4 py-4 space-y-4 flex-1">
        <WoodFrame
          title="TOWN MARKET & BUDGETS"
          subtitle="Log expenses, track needs vs wants, and keep categories out of the red"
        >
          {/* Single Calm Stone Panel with Gold Tab Underline */}
          <StonePanel className="space-y-4">
            {/* Tabs with Gold Underline */}
            <div className="flex border-b border-[#4B515A] gap-4 sm:gap-6 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('log')}
                className={`pb-1 text-xs sm:text-sm font-heading cursor-pointer transition-colors ${
                  activeTab === 'log'
                    ? 'text-[#FFD95A] border-b-2 border-[#FFD95A]'
                    : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
                }`}
              >
                Log Expense
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('budgets')}
                className={`pb-1 text-xs sm:text-sm font-heading cursor-pointer transition-colors ${
                  activeTab === 'budgets'
                    ? 'text-[#FFD95A] border-b-2 border-[#FFD95A]'
                    : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
                }`}
              >
                Budgets & History
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('blitz')}
                className={`pb-1 text-xs sm:text-sm font-heading cursor-pointer transition-colors ${
                  activeTab === 'blitz'
                    ? 'text-[#FFD95A] border-b-2 border-[#FFD95A]'
                    : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
                }`}
              >
                Needs vs Wants Blitz ⚡
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('recurring')}
                className={`pb-1 text-xs sm:text-sm font-heading cursor-pointer transition-colors ${
                  activeTab === 'recurring'
                    ? 'text-[#FFD95A] border-b-2 border-[#FFD95A]'
                    : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
                }`}
              >
                Subscriptions & Bills ({recurringExpenses.length})
              </button>
            </div>

            {/* Tab 1: Option C 2-Step Quick-Add Flow */}
            {activeTab === 'log' && (
              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                {/* Step 1: Amount */}
                <div className="space-y-1.5">
                  <label className="text-xs font-sans uppercase tracking-wider text-[#FFD95A] font-bold">
                    Step 1 · Enter Amount (₹)
                  </label>
                  <PixelInput
                    prefix="₹"
                    type="number"
                    min="1"
                    step="10"
                    placeholder="e.g. 850"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                {/* Step 2: Category Chips */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-sans uppercase tracking-wider text-[#FFD95A] font-bold">
                      Step 2 · Select Category
                    </label>
                    <span className="text-[11px] text-[#B4BAC4]">
                      Tag: <strong className={tag === 'need' ? 'text-[#2A9D8F]' : 'text-[#E76F51]'}>{tag.toUpperCase()}</strong>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {state.categories.map((c) => {
                      const isSelected = categoryId === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleCategorySelect(c.id)}
                          className={`px-3 py-1.5 text-xs sm:text-sm font-sans transition-colors cursor-pointer border ${
                            isSelected
                              ? 'bg-[#FFD95A] text-[#1B1B1F] font-bold border-[#FFD95A]'
                              : 'bg-[#2E333B] text-[#FFF4D6] border-[#4B515A] hover:border-[#B4BAC4]'
                          }`}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Advanced Options Disclosure (Date, Note, Classification, Custom Category) */}
                <div className="pt-1 border-t border-[#4B515A]/60">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs text-[#D4A373] hover:text-[#FFD95A] underline cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{showAdvanced ? '▼' : '▶'}</span>
                    <span>Advanced options (Date, Note, Classification, Custom Category)</span>
                  </button>

                  {showAdvanced && (
                    <div className="mt-3 space-y-3 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <PixelInput
                          label="Date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          required
                        />

                        <PixelInput
                          label="Memo / Note"
                          placeholder="e.g. Grocery items..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        />

                        <div>
                          <label className="text-xs font-sans text-[#FFF4D6] uppercase tracking-wider block mb-1 font-bold">
                            Classification
                          </label>
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setTag('need')}
                              className={`px-3 py-1.5 text-xs font-sans border cursor-pointer ${
                                tag === 'need'
                                  ? 'bg-[#2A9D8F] text-white border-[#2A9D8F] font-bold'
                                  : 'bg-[#2E333B] text-[#B4BAC4] border-[#4B515A]'
                              }`}
                            >
                              Need
                            </button>
                            <button
                              type="button"
                              onClick={() => setTag('want')}
                              className={`px-3 py-1.5 text-xs font-sans border cursor-pointer ${
                                tag === 'want'
                                  ? 'bg-[#E76F51] text-white border-[#E76F51] font-bold'
                                  : 'bg-[#2E333B] text-[#B4BAC4] border-[#4B515A]'
                              }`}
                            >
                              Want
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Custom category creator link */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddCat(!showAddCat)}
                          className="text-xs text-[#D4A373] hover:text-[#FFD95A] underline cursor-pointer"
                        >
                          {showAddCat ? 'Cancel custom category' : '+ Add custom category'}
                        </button>

                        {showAddCat && (
                          <div className="mt-2 p-3 bg-[#2E333B] border border-[#4B515A] space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <PixelInput
                                label="Name"
                                placeholder="e.g. Books, Tech"
                                value={newCatName}
                                onChange={(e) => setNewCatName(e.target.value)}
                              />
                              <PixelSelect
                                label="Type"
                                value={newCatTag}
                                onChange={(e) => setNewCatTag(e.target.value as NeedWantTag)}
                                options={[
                                  { value: 'need', label: 'Need' },
                                  { value: 'want', label: 'Want' },
                                ]}
                              />
                              <PixelInput
                                label="Limit (₹)"
                                prefix="₹"
                                type="number"
                                placeholder="e.g. 2500"
                                value={newCatLimit}
                                onChange={(e) => setNewCatLimit(e.target.value)}
                              />
                            </div>
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={handleAddCategorySubmit}
                                className="text-xs text-[#FFD95A] hover:underline font-bold cursor-pointer"
                              >
                                Save Category
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Exactly One Primary Action Button per screen in solid gold */}
                <div className="pt-2">
                  <PixelButton variant="primary" size="md" type="submit" fullWidth>
                    Log Expense (-₹)
                  </PixelButton>
                </div>
              </form>
            )}

            {/* Tab 2: Budgets & History (Option A Calm Panel) */}
            {activeTab === 'budgets' && (
              <div className="space-y-4">
                {/* Section 1: Category Monthly Budgets */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-1 border-b border-[#4B515A]/60">
                    <span className="text-xs sm:text-sm font-sans font-bold text-[#FFD95A] uppercase tracking-wider">
                      Monthly Budgets & Limits
                    </span>
                    <span className="text-[11px] text-[#B4BAC4]">
                      Green &lt;80% · Amber 80–99% · Red 100%+
                    </span>
                  </div>

                  <div className="space-y-3">
                    {budgetStatuses.map((b) => {
                      const barColor =
                        b.status === 'danger'
                          ? 'bg-[#EE6A5E]'
                          : b.status === 'warning'
                          ? 'bg-[#FFD95A]'
                          : 'bg-[#5DB84A]';

                      return (
                        <div key={b.category.id} className="space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm gap-2">
                            <div className="flex items-center gap-2">
                              <strong className="text-[#FFF4D6] font-sans">{b.category.name}</strong>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 border uppercase ${
                                  b.category.defaultTag === 'need'
                                    ? 'border-[#2A9D8F] text-[#2A9D8F]'
                                    : 'border-[#E76F51] text-[#E76F51]'
                                }`}
                              >
                                {b.category.defaultTag}
                              </span>

                              {b.category.isCustom && (
                                <div className="flex items-center gap-2 ml-1 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingNameId(b.category.id);
                                      setNameInput(b.category.name);
                                    }}
                                    className="text-xs text-[#D4A373] hover:text-[#FFD95A] underline cursor-pointer"
                                  >
                                    Rename
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteCategory(b.category.id)}
                                    className="text-xs text-[#EE6A5E] hover:underline cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm">
                              <span>
                                ₹{b.spent.toLocaleString('en-IN')} /{' '}
                                <strong className="text-[#FFD95A]">₹{b.limit.toLocaleString('en-IN')}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingLimitId(b.category.id);
                                  setLimitInput(String(b.limit));
                                }}
                                className="text-xs text-[#D4A373] hover:text-[#FFD95A] underline cursor-pointer ml-1 font-sans"
                              >
                                Edit limit
                              </button>
                            </div>
                          </div>

                          {/* Inline Rename Form */}
                          {editingNameId === b.category.id && (
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                className="bg-[#181A1E] text-[#FFF4D6] text-xs px-2 py-1 border border-[#4B515A] flex-1"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveName(b.category.id)}
                                className="text-xs text-[#FFD95A] hover:underline font-bold cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingNameId(null)}
                                className="text-xs text-[#B4BAC4] hover:underline cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          )}

                          {/* Inline Edit Limit Form */}
                          {editingLimitId === b.category.id && (
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-xs text-[#B4BAC4]">₹</span>
                              <input
                                type="number"
                                min="0"
                                step="100"
                                className="bg-[#181A1E] text-[#FFF4D6] text-xs px-2 py-1 border border-[#4B515A] w-32 font-mono"
                                value={limitInput}
                                onChange={(e) => setLimitInput(e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveLimit(b.category.id)}
                                className="text-xs text-[#FFD95A] hover:underline font-bold cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingLimitId(null)}
                                className="text-xs text-[#B4BAC4] hover:underline cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          )}

                          {/* Clean Progress Bar */}
                          <div className="w-full h-2.5 bg-[#1B1B1F] border border-[#4B515A] overflow-hidden">
                            <div
                              className={`h-full ${barColor} transition-all`}
                              style={{ width: `${Math.min(100, b.pct * 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Expense History (last 3 items + See all link) */}
                <div className="space-y-2 pt-3 border-t border-[#4B515A]/60">
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-xs sm:text-sm font-sans font-bold text-[#FFD95A] uppercase tracking-wider">
                      Recent Expenses
                    </span>
                    {expenses.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setShowAllHistory(!showAllHistory)}
                        className="text-xs text-[#D4A373] hover:text-[#FFD95A] underline cursor-pointer"
                      >
                        {showAllHistory ? 'Show latest 3' : `See all (${expenses.length})`}
                      </button>
                    )}
                  </div>

                  {expenses.length === 0 ? (
                    <p className="text-center italic py-3 text-xs text-[#B4BAC4]">
                      No expenses logged yet.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-sans text-xs sm:text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-[#4B515A] text-[#B4BAC4] uppercase text-[11px]">
                            <th className="py-1.5 px-2">Date</th>
                            <th className="py-1.5 px-2">Category</th>
                            <th className="py-1.5 px-2">Tag</th>
                            <th className="py-1.5 px-2">Note</th>
                            <th className="py-1.5 px-2 text-right">Amount</th>
                            <th className="py-1.5 px-2 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedExpenses.map((exp, idx) => {
                            const cat = state.categories.find((c) => c.id === exp.categoryId);
                            return (
                              <tr
                                key={exp.id}
                                className={`border-b border-[#4B515A]/30 ${
                                  idx % 2 === 0 ? 'bg-[#3A3F47]' : 'bg-[#32363E]'
                                }`}
                              >
                                <td className="py-2 px-2 text-[#B4BAC4] whitespace-nowrap">{exp.date}</td>
                                <td className="py-2 px-2 text-[#FFF4D6] whitespace-nowrap">{cat?.name || 'Other'}</td>
                                <td className="py-2 px-2 whitespace-nowrap">
                                  <span
                                    className={`text-[10px] px-1.5 py-0.2 border uppercase ${
                                      exp.tag === 'need'
                                        ? 'border-[#2A9D8F] text-[#2A9D8F]'
                                        : 'border-[#E76F51] text-[#E76F51]'
                                    }`}
                                  >
                                    {exp.tag || 'need'}
                                  </span>
                                </td>
                                <td className="py-2 px-2 text-[#B4BAC4] truncate max-w-[140px]">
                                  {exp.note || '—'}
                                </td>
                                <td className="py-2 px-2 text-right font-mono font-bold text-[#EE6A5E] whitespace-nowrap">
                                  -₹{exp.amount.toLocaleString('en-IN')}
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => deleteTransaction(exp.id)}
                                    className="text-xs text-[#EE6A5E] hover:underline cursor-pointer"
                                    title="Delete entry"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Needs vs. Wants Blitz Arcade */}
            {activeTab === 'blitz' && (
              <div className="space-y-4 font-sans text-xs sm:text-sm">
                {!blitzPlaying && !blitzFinished ? (
                  /* Blitz Start Splash Screen */
                  <div className="p-4 sm:p-6 bg-[#23252B] border-2 border-[#B79A60] text-center space-y-4">
                    <div className="text-4xl animate-bounce">⚡🛒</div>
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-heading text-[#FFD95A]">
                        NEEDS VS. WANTS BLITZ
                      </h3>
                      <p className="text-xs sm:text-sm text-[#FFF4D6] max-w-md mx-auto leading-relaxed">
                        Sharpen your financial reflexes! You have <strong>25 seconds</strong> to sort everyday purchases into <strong>NEEDS</strong> (survival & non-negotiables) vs <strong>WANTS</strong> (lifestyle & optional).
                      </p>
                    </div>

                    <div className="flex justify-center gap-2 sm:gap-4 text-xs font-mono text-[#B4BAC4]">
                      <span className="p-2 bg-[#1B1B1F] border border-[#4B515A]">⏱️ 25s Timer</span>
                      <span className="p-2 bg-[#1B1B1F] border border-[#4B515A]">🔥 Combo Streaks</span>
                      <span className="p-2 bg-[#1B1B1F] border border-[#4B515A]">⭐ Earns Renown</span>
                    </div>

                    <div className="pt-2 max-w-xs mx-auto">
                      <PixelButton variant="primary" size="lg" fullWidth onClick={startBlitz}>
                        START BLITZ ⚡
                      </PixelButton>
                    </div>
                  </div>
                ) : blitzPlaying ? (
                  /* Active Gameplay Card */
                  <div className="p-4 sm:p-6 bg-[#23252B] border-2 border-[#FFD95A] space-y-4 relative overflow-hidden">
                    {/* Header stats bar */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#4B515A]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-heading text-[#B4BAC4]">TIME:</span>
                        <span className={`text-base font-mono font-bold ${blitzTimeLeft <= 5 ? 'text-[#EE6A5E] animate-ping' : 'text-[#FFD95A]'}`}>
                          {blitzTimeLeft}s
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {blitzStreak >= 2 && (
                          <span className="text-[11px] font-heading px-2 py-0.5 bg-[#FFD95A] text-[#1B1B1F] font-bold rounded animate-pulse">
                            {blitzStreak}x COMBO 🔥
                          </span>
                        )}
                        <span className="text-sm font-mono font-bold text-[#FFF4D6]">
                          {blitzScore} PTS
                        </span>
                      </div>
                    </div>

                    {/* Flashcard Item */}
                    <div className="py-6 sm:py-8 bg-[#1B1B1F] border border-[#4B515A] rounded flex flex-col items-center justify-center text-center space-y-2 relative">
                      <span className="text-5xl sm:text-6xl mb-1 transform hover:scale-110 transition-transform">
                        {blitzShuffledItems[blitzItemIdx]?.icon}
                      </span>
                      <h4 className="text-base sm:text-lg font-heading text-[#FFF4D6]">
                        {blitzShuffledItems[blitzItemIdx]?.name}
                      </h4>
                      <span className="text-[11px] px-2 py-0.5 bg-[#2E333B] text-[#B4BAC4] border border-[#4B515A] uppercase tracking-wider">
                        {blitzShuffledItems[blitzItemIdx]?.category}
                      </span>

                      {/* Feedback overlay */}
                      {blitzFeedback && (
                        <div
                          className={`absolute inset-0 flex items-center justify-center font-heading text-sm sm:text-base font-bold bg-[#1B1B1F]/90 backdrop-blur-xs animate-fadeIn ${
                            blitzFeedback.correct ? 'text-[#79CE5E]' : 'text-[#EE6A5E]'
                          }`}
                        >
                          {blitzFeedback.text}
                        </div>
                      )}
                    </div>

                    {/* Big Action Choice Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleBlitzChoice('need')}
                        className="py-4 px-3 bg-[#1D3A2A] hover:bg-[#2A5C3D] text-[#79CE5E] border-2 border-[#79CE5E] font-heading text-sm sm:text-base font-bold shadow-[0_4px_0_#0D1F15] active:translate-y-1 active:shadow-none cursor-pointer transition-all flex flex-col items-center gap-1 select-none"
                      >
                        <span className="text-xl">🥗</span>
                        <span>NEED</span>
                        <span className="text-[10px] text-[#A2E394] font-normal hidden sm:inline">Essential / Survival</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBlitzChoice('want')}
                        className="py-4 px-3 bg-[#3A1D1D] hover:bg-[#5C2A2A] text-[#EE6A5E] border-2 border-[#EE6A5E] font-heading text-sm sm:text-base font-bold shadow-[0_4px_0_#1F0D0D] active:translate-y-1 active:shadow-none cursor-pointer transition-all flex flex-col items-center gap-1 select-none"
                      >
                        <span className="text-xl">🎁</span>
                        <span>WANT</span>
                        <span className="text-[10px] text-[#FFA8A0] font-normal hidden sm:inline">Discretionary / Luxury</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Game Finished Recap Screen */
                  <div className="p-4 sm:p-6 bg-[#23252B] border-2 border-[#79CE5E] text-center space-y-4 animate-fadeIn">
                    <div className="text-4xl">🏆</div>
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-heading text-[#FFD95A]">
                        BLITZ COMPLETED!
                      </h3>
                      <p className="text-xs sm:text-sm text-[#FFF4D6]">
                        Superb reflexes! You categorized expenses with lightning speed.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto font-mono text-center">
                      <div className="p-2 bg-[#1B1B1F] border border-[#4B515A]">
                        <span className="text-[10px] text-[#B4BAC4] block uppercase">Score</span>
                        <span className="text-sm sm:text-base font-bold text-[#FFD95A]">{blitzScore}</span>
                      </div>
                      <div className="p-2 bg-[#1B1B1F] border border-[#4B515A]">
                        <span className="text-[10px] text-[#B4BAC4] block uppercase">Max Combo</span>
                        <span className="text-sm sm:text-base font-bold text-[#79CE5E]">{blitzMaxStreak}x</span>
                      </div>
                      <div className="p-2 bg-[#1B1B1F] border border-[#4B515A]">
                        <span className="text-[10px] text-[#B4BAC4] block uppercase">Renown</span>
                        <span className="text-sm sm:text-base font-bold text-[#FFD95A]">+{blitzRenownEarned} ⭐</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-[#1B1B1F] border border-[#B79A60] text-xs text-[#FFF4D6] max-w-md mx-auto">
                      ⭐ <strong>+{blitzRenownEarned} Renown</strong> has been credited to your town! Use it to commission civic decorations at Town Hall.
                    </div>

                    <div className="flex gap-3 justify-center pt-2 max-w-sm mx-auto">
                      <PixelButton variant="primary" size="md" fullWidth onClick={startBlitz}>
                        PLAY AGAIN ⚡
                      </PixelButton>
                      <Link href="/" className="w-full">
                        <PixelButton variant="wood" size="md" fullWidth>
                          TOWN MAP
                        </PixelButton>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Subscriptions & Recurring Bills */}
            {activeTab === 'recurring' && (
              <div className="space-y-4">
                {/* Header Summary & Add Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#4B515A]/60">
                  <div>
                    <h3 className="text-sm font-heading text-[#FFD95A]">
                      RECURRING SUBSCRIPTIONS & FIXED BILLS
                    </h3>
                    <p className="text-xs text-[#B4BAC4]">
                      Rent, broadband, Netflix, gym fees, or SIPs automatically recorded each cycle.
                    </p>
                  </div>
                  <PixelButton
                    variant="wood"
                    size="sm"
                    onClick={() => setShowAddRec(!showAddRec)}
                  >
                    {showAddRec ? 'CANCEL' : '+ ADD BILL / SUB'}
                  </PixelButton>
                </div>

                {/* Recurring Summary Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 bg-[#1B1B1F] border border-[#4B515A]">
                    <span className="text-[10px] text-[#B4BAC4] block uppercase">Est. Monthly Outflow</span>
                    <span className="text-sm sm:text-base font-bold text-[#EE6A5E] font-mono">
                      ₹{Math.round(
                        recurringExpenses
                          .filter((r) => r.active)
                          .reduce((sum, r) => {
                            if (r.frequency === 'daily') return sum + r.amount * 30;
                            if (r.frequency === 'weekly') return sum + r.amount * 4.33;
                            return sum + r.amount;
                          }, 0)
                      ).toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#1B1B1F] border border-[#4B515A]">
                    <span className="text-[10px] text-[#B4BAC4] block uppercase">Active Subscriptions</span>
                    <span className="text-sm sm:text-base font-bold text-[#79CE5E] font-mono">
                      {recurringExpenses.filter((r) => r.active).length} of {recurringExpenses.length} Active
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 p-2.5 bg-[#1B1B1F] border border-[#4B515A]">
                    <span className="text-[10px] text-[#B4BAC4] block uppercase">Next Leak Audit</span>
                    <span className="text-xs font-bold text-[#FFD95A]">Recommended: Quarterly</span>
                  </div>
                </div>

                {/* Add Recurring Form */}
                {showAddRec && (
                  <form
                    onSubmit={handleAddRecurringExpense}
                    className="p-3.5 bg-[#23252B] border-2 border-[#D4A373] space-y-3 animate-fadeIn"
                  >
                    <div className="text-xs font-heading text-[#FFD95A]">
                      NEW RECURRING BILL OR SUBSCRIPTION
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-[#B4BAC4] block mb-1">
                          Category
                        </label>
                        <PixelSelect
                          value={recCategoryId}
                          onChange={(e) => {
                            const newCat = e.target.value;
                            setRecCategoryId(newCat);
                            const cat = state.categories.find((c) => c.id === newCat);
                            if (cat) setRecTag(cat.defaultTag);
                          }}
                          options={state.categories.map((c) => ({
                            value: c.id,
                            label: c.name,
                          }))}
                        />
                      </div>

                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-[#B4BAC4] block mb-1">
                          Amount (₹)
                        </label>
                        <PixelInput
                          prefix="₹"
                          type="number"
                          min="1"
                          placeholder="e.g. 1199"
                          value={recAmount}
                          onChange={(e) => setRecAmount(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-[#B4BAC4] block mb-1">
                          Frequency
                        </label>
                        <PixelSelect
                          value={recFreq}
                          onChange={(e) => setRecFreq(e.target.value as 'daily' | 'weekly' | 'monthly')}
                          options={[
                            { value: 'monthly', label: 'Monthly (e.g. Rent/WiFi)' },
                            { value: 'weekly', label: 'Weekly (e.g. Groceries)' },
                            { value: 'daily', label: 'Daily (e.g. Newspaper/Milk)' },
                          ]}
                        />
                      </div>
                    </div>

                    {/* Tag toggle (Need vs Want) */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#B4BAC4]">Classification:</span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setRecTag('need')}
                            className={`px-2 py-0.5 text-xs font-heading border cursor-pointer ${
                              recTag === 'need'
                                ? 'bg-[#2A9D8F] text-[#FFF4D6] border-[#2A9D8F]'
                                : 'bg-[#1B1B1F] text-[#B4BAC4] border-[#4B515A]'
                            }`}
                          >
                            NEED (Fixed Bill)
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecTag('want')}
                            className={`px-2 py-0.5 text-xs font-heading border cursor-pointer ${
                              recTag === 'want'
                                ? 'bg-[#E76F51] text-[#FFF4D6] border-[#E76F51]'
                                : 'bg-[#1B1B1F] text-[#B4BAC4] border-[#4B515A]'
                            }`}
                          >
                            WANT (Optional Sub)
                          </button>
                        </div>
                      </div>

                      <PixelButton variant="primary" size="sm" type="submit">
                        SAVE BILL RULE
                      </PixelButton>
                    </div>
                  </form>
                )}

                {/* Subscriptions List */}
                {recurringExpenses.length === 0 ? (
                  <div className="p-6 bg-[#23252B] border border-[#4B515A] text-center space-y-2">
                    <div className="text-3xl">📅</div>
                    <p className="text-xs sm:text-sm text-[#FFF4D6]">
                      No recurring subscriptions or bills active.
                    </p>
                    <p className="text-xs text-[#B4BAC4]">
                      Add regular rent, electricity, Netflix, or gym fees here so they are accounted for automatically!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recurringExpenses.map((rec) => {
                      const cat = state.categories.find((c) => c.id === rec.categoryId);
                      return (
                        <div
                          key={rec.id}
                          className="p-3 bg-[#23252B] border border-[#4B515A] flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all hover:border-[#B79A60]"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🏷️</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-bold text-[#FFF4D6]">
                                  {cat?.name || 'Expense'}
                                </span>
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 border uppercase font-bold ${
                                    rec.tag === 'need'
                                      ? 'text-[#2A9D8F] border-[#2A9D8F]/60 bg-[#2A9D8F]/10'
                                      : 'text-[#E76F51] border-[#E76F51]/60 bg-[#E76F51]/10'
                                  }`}
                                >
                                  {rec.tag}
                                </span>
                              </div>
                              <span className="text-[11px] text-[#B4BAC4] uppercase tracking-wider">
                                {rec.frequency} · Started {rec.startDate}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#4B515A]/40">
                            <div className="text-right">
                              <span className="text-sm sm:text-base font-mono font-bold text-[#FFD95A]">
                                ₹{rec.amount.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] text-[#B4BAC4] block">
                                per {rec.frequency === 'daily' ? 'day' : rec.frequency === 'weekly' ? 'week' : 'month'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleRecurring(rec.id)}
                                className={`text-xs px-2 py-1 border cursor-pointer font-bold transition-colors ${
                                  rec.active
                                    ? 'text-[#79CE5E] border-[#79CE5E]/50 bg-[#79CE5E]/10 hover:bg-[#79CE5E]/20'
                                    : 'text-[#EE6A5E] border-[#EE6A5E]/50 bg-[#EE6A5E]/10 hover:bg-[#EE6A5E]/20'
                                }`}
                              >
                                {rec.active ? 'ACTIVE' : 'PAUSED'}
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteRecurring(rec.id)}
                                className="text-xs text-[#EE6A5E] hover:text-[#FF8A8A] hover:underline p-1 cursor-pointer"
                                title="Delete Rule"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Behavioral Pro-Tip Banner */}
                <div className="p-3 bg-[#1B1B1F] border border-[#B79A60] rounded-none flex items-start gap-2.5">
                  <span className="text-lg">💡</span>
                  <div className="text-xs text-[#FFF4D6] space-y-1">
                    <p className="font-bold text-[#FFD95A]">
                      The Subscription Trap (Behavioral Finance)
                    </p>
                    <p className="text-[#B4BAC4] leading-relaxed">
                      Micro-subscriptions (₹299 for streaming, ₹499 for cloud storage, ₹1,499 for unused gym) feel negligible on day 1 because they bypass cognitive friction. Audit your recurring expenses quarterly and pause any service not used in the last 30 days!
                    </p>
                  </div>
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
