'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { WoodFrame } from '@/components/ui/WoodFrame';
import { StonePanel } from '@/components/ui/StonePanel';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelInput } from '@/components/ui/PixelInput';
import { PixelSelect } from '@/components/ui/PixelSelect';
import { PixelChip } from '@/components/ui/PixelChip';
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
  const [showMoreOptions, setShowMoreOptions] = useState(false);
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

  const displayedExpenses = showAllHistory ? expenses : expenses.slice(0, 5);

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-[#1B1B1F]">
      <HudBar />

      <div className="w-full max-w-[720px] px-3 sm:px-4 py-4 space-y-4 flex-1">
        <WoodFrame
          title="TOWN MARKET & BUDGETS"
          subtitle="Log expenses, track needs vs wants, and keep categories out of the red"
        >
          <div className="space-y-4">
            {/* Main Action (top, always visible): Log Expense Form */}
            <StonePanel title="Log Expense (-₹)">
              <form onSubmit={handleExpenseSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <PixelInput
                    label="Amount (₹)"
                    prefix="₹"
                    type="number"
                    min="1"
                    step="10"
                    placeholder="e.g. 850"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />

                  <PixelSelect
                    label="Category"
                    value={categoryId}
                    onChange={(e) => handleCategorySelect(e.target.value)}
                    options={state.categories.map((c) => ({
                      value: c.id,
                      label: `${c.name} (${c.defaultTag.toUpperCase()})`,
                    }))}
                  />

                  <PixelInput
                    label="Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                {/* 'More options' text button for tag, memo, and custom category */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowMoreOptions(!showMoreOptions)}
                    className="text-[14px] text-[#FFD95A] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>{showMoreOptions ? '▼' : '▶'}</span>
                    <span>More options (Classification, Note, Custom category)</span>
                  </button>

                  {showMoreOptions && (
                    <div className="mt-2 p-3 bg-[#2E333B] border border-[#4B515A] space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                        <div>
                          <label className="text-xs font-heading text-[#FFF4D6] uppercase block mb-1">
                            Classification
                          </label>
                          <div className="flex gap-2">
                            <PixelChip
                              label="Need (Essential)"
                              variant="need"
                              selected={tag === 'need'}
                              onClick={() => setTag('need')}
                            />
                            <PixelChip
                              label="Want (Discretionary)"
                              variant="want"
                              selected={tag === 'want'}
                              onClick={() => setTag('want')}
                            />
                          </div>
                        </div>

                        <PixelInput
                          label="Memo / Note"
                          placeholder="e.g. Grocery items, dinner..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        />
                      </div>

                      <div className="pt-1 border-t border-[#4B515A]/60 flex justify-between items-center">
                        <button
                          type="button"
                          onClick={() => setShowAddCat(!showAddCat)}
                          className="text-[14px] text-[#FFF4D6] hover:text-[#FFD95A] underline cursor-pointer"
                        >
                          {showAddCat ? '✕ Cancel new category' : '+ Add custom category'}
                        </button>
                      </div>

                      {showAddCat && (
                        <div className="p-2.5 bg-[#3A3F47] border border-[#FFD95A] space-y-2 mt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <PixelInput
                              label="Name"
                              placeholder="e.g. Books, Gaming"
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
                            <PixelButton
                              variant="primary"
                              size="sm"
                              type="button"
                              onClick={handleAddCategorySubmit}
                            >
                              Save Category
                            </PixelButton>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <PixelButton variant="primary" size="md" type="submit">
                    Log Expense (-₹)
                  </PixelButton>
                </div>
              </form>
            </StonePanel>

            {/* Two Tabs: Tab 1: Log, Tab 2: Budgets */}
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
                onClick={() => setActiveTab('budgets')}
                className={`px-4 py-2 text-[14px] font-heading cursor-pointer transition-colors ${
                  activeTab === 'budgets'
                    ? 'bg-[#8B5E34] text-[#FFD95A] border-2 border-[#D9A05E]'
                    : 'bg-[#5C3826] text-[#FFF4D6] border-2 border-[#8B5E34] hover:bg-[#6E442F]'
                }`}
              >
                Budgets
              </button>
            </div>

            {/* Tab 1: Log (History of latest 5 rows + Show all) */}
            {activeTab === 'log' && (
              <StonePanel title={`Expense History (${expenses.length} Entries)`}>
                {expenses.length === 0 ? (
                  <p className="text-center italic py-2 text-[#B4BAC4]">
                    No expenses logged yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-body text-[20px] border-collapse">
                        <thead>
                          <tr className="border-b border-[#4B515A] text-[#FFD95A] font-heading text-[12px] uppercase">
                            <th className="py-1 px-2">Date</th>
                            <th className="py-1 px-2">Category</th>
                            <th className="py-1 px-2">Tag</th>
                            <th className="py-1 px-2">Note</th>
                            <th className="py-1 px-2 text-right">Amount</th>
                            <th className="py-1 px-2 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedExpenses.map((exp, idx) => {
                            const cat = state.categories.find((c) => c.id === exp.categoryId);
                            return (
                              <tr
                                key={exp.id}
                                className={`border-b border-[#4B515A]/40 ${
                                  idx % 2 === 0 ? 'bg-[#3A3F47]' : 'bg-[#333840]'
                                }`}
                              >
                                <td className="py-1.5 px-2 text-[#B4BAC4]">{exp.date}</td>
                                <td className="py-1.5 px-2">{cat?.name || 'Other'}</td>
                                <td className="py-1.5 px-2">
                                  <PixelChip label={exp.tag || 'need'} variant={exp.tag || 'need'} size="sm" />
                                </td>
                                <td className="py-1.5 px-2 text-[#B4BAC4] truncate max-w-[140px]">
                                  {exp.note || '—'}
                                </td>
                                <td className="py-1.5 px-2 text-right text-[#EE6A5E]">
                                  -₹{exp.amount.toLocaleString('en-IN')}
                                </td>
                                <td className="py-1.5 px-2 text-center">
                                  <button
                                    onClick={() => deleteTransaction(exp.id)}
                                    className="text-xs text-[#EE6A5E] hover:underline cursor-pointer"
                                    title="Delete entry"
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {expenses.length > 5 && (
                      <div className="text-center pt-1">
                        <button
                          onClick={() => setShowAllHistory(!showAllHistory)}
                          className="text-[14px] text-[#FFD95A] hover:underline cursor-pointer"
                        >
                          {showAllHistory ? 'Show latest 5' : `Show all (${expenses.length})`}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </StonePanel>
            )}

            {/* Tab 2: Budgets (one row per category with limit input, spent amount, and block bar) */}
            {activeTab === 'budgets' && (
              <StonePanel title="Category Monthly Budgets">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs text-[#B4BAC4] pb-1 border-b border-[#4B515A]">
                    <span>Green &lt;80% | Amber 80–99% | Red 100%+</span>
                  </div>

                  <div className="space-y-3">
                    {budgetStatuses.map((b) => (
                      <div
                        key={b.category.id}
                        className="p-3 bg-[#2E333B] border border-[#4B515A] space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <strong className="text-[#FFF4D6] text-[18px]">
                              {b.category.name}
                            </strong>
                            <PixelChip label={b.category.defaultTag} variant={b.category.defaultTag} size="sm" />

                            {b.category.isCustom && (
                              <div className="flex items-center gap-2 ml-1 text-xs">
                                <button
                                  onClick={() => {
                                    setEditingNameId(b.category.id);
                                    setNameInput(b.category.name);
                                  }}
                                  className="text-[#FFD95A] hover:underline cursor-pointer"
                                  title="Rename category"
                                >
                                  ✏️ Rename
                                </button>
                                <button
                                  onClick={() => deleteCategory(b.category.id)}
                                  className="text-[#EE6A5E] hover:underline cursor-pointer"
                                  title="Delete category (if 0 transactions)"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[16px]">
                            <span>
                              ₹{b.spent.toLocaleString('en-IN')} /{' '}
                              <strong className="text-[#FFD95A]">
                                ₹{b.limit.toLocaleString('en-IN')}
                              </strong>
                            </span>
                            <button
                              onClick={() => {
                                setEditingLimitId(b.category.id);
                                setLimitInput(String(b.limit));
                              }}
                              className="text-xs text-[#B4BAC4] hover:text-[#FFD95A] underline cursor-pointer ml-1"
                            >
                              Edit limit
                            </button>
                          </div>
                        </div>

                        {/* Inline Rename Form */}
                        {editingNameId === b.category.id && (
                          <div className="flex items-center gap-2 pt-1">
                            <PixelInput
                              size={14}
                              value={nameInput}
                              onChange={(e) => setNameInput(e.target.value)}
                              placeholder="New name"
                            />
                            <PixelButton variant="primary" size="sm" onClick={() => handleSaveName(b.category.id)}>
                              Save
                            </PixelButton>
                            <PixelButton variant="wood" size="sm" onClick={() => setEditingNameId(null)}>
                              ✕
                            </PixelButton>
                          </div>
                        )}

                        {/* Inline Limit Form */}
                        {editingLimitId === b.category.id && (
                          <div className="flex items-center gap-2 pt-1">
                            <PixelInput
                              prefix="₹"
                              type="number"
                              size={10}
                              value={limitInput}
                              onChange={(e) => setLimitInput(e.target.value)}
                              placeholder="New limit"
                            />
                            <PixelButton variant="primary" size="sm" onClick={() => handleSaveLimit(b.category.id)}>
                              Save
                            </PixelButton>
                            <PixelButton variant="wood" size="sm" onClick={() => setEditingLimitId(null)}>
                              ✕
                            </PixelButton>
                          </div>
                        )}

                        {/* Block Bar Status */}
                        <div className="w-full h-3 bg-[#1B1B1F] border border-[#4B515A] overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              b.status === 'danger'
                                ? 'bg-[#EE6A5E]'
                                : b.status === 'warning'
                                ? 'bg-[#F4B63A]'
                                : 'bg-[#5DB84A]'
                            }`}
                            style={{ width: `${Math.min(100, b.pct * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
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
