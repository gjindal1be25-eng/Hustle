'use client';

import React, { useState } from 'react';
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
  } = useGame();

  const [activeTab, setActiveTab] = useState<'log' | 'budgets'>('log');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

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
