'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { WoodFrame } from '@/components/ui/WoodFrame';
import { StonePanel } from '@/components/ui/StonePanel';
import { RpgTextBox } from '@/components/ui/RpgTextBox';
import { HudBar } from '@/components/ui/HudBar';
import { BADGE_DEFINITIONS } from '@/lib/constants';
import {
  calculateMonthlySavingsRate,
  calculateWantsShare,
  getCurrentMonthISO,
  getTodayISO,
} from '@/lib/rules';

export default function TownHallPage() {
  const {
    state,
    balance,
    netSavings,
    avgMonthlyIncome,
    savedMonths,
    budgetStatuses,
    insightTips,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'summary' | 'recap'>('summary');
  const [openDonut, setOpenDonut] = useState(true);
  const [openMonths, setOpenMonths] = useState(true);
  const [openBudgets, setOpenBudgets] = useState(true);
  const [openTips, setOpenTips] = useState(true);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const today = getTodayISO();
  const currentMonth = getCurrentMonthISO(today);

  // Calculate monthly stats
  const savingsRate = Math.round(
    calculateMonthlySavingsRate(state.transactions, currentMonth) * 100
  );
  const wantsShare = Math.round(
    calculateWantsShare(state.transactions, currentMonth) * 100
  );
  const needsShare = Math.max(0, 100 - wantsShare);

  // Group expenses by category for current month
  const categorySplit: { name: string; amount: number; pct: number }[] = [];
  let totalMonthExpense = 0;
  let totalMonthIncome = 0;

  for (const t of state.transactions) {
    if (t.date.startsWith(currentMonth)) {
      if (t.type === 'expense') totalMonthExpense += t.amount;
      if (t.type === 'income') totalMonthIncome += t.amount;
    }
  }

  for (const cat of state.categories) {
    let catTotal = 0;
    for (const t of state.transactions) {
      if (t.type === 'expense' && t.categoryId === cat.id && t.date.startsWith(currentMonth)) {
        catTotal += t.amount;
      }
    }
    if (catTotal > 0 && totalMonthExpense > 0) {
      categorySplit.push({
        name: cat.name,
        amount: catTotal,
        pct: Math.round((catTotal / totalMonthExpense) * 100),
      });
    }
  }

  // Monthly block stack bars data (last 3 months)
  const months = Array.from(
    new Set(state.transactions.map((t) => t.date.slice(0, 7)))
  ).sort().slice(-3);

  const monthBlocks = months.map((m) => {
    let inc = 0;
    let exp = 0;
    for (const t of state.transactions) {
      if (t.date.startsWith(m)) {
        if (t.type === 'income') inc += t.amount;
        if (t.type === 'expense') exp += t.amount;
      }
    }
    const blockSize = 5000; // ₹5,000 per block
    return {
      month: m,
      inc,
      exp,
      incBlocks: inc > 0 ? Math.max(1, Math.round(inc / blockSize)) : 0,
      expBlocks: exp > 0 ? Math.max(1, Math.round(exp / blockSize)) : 0,
    };
  });

  // Category donut segments calculation
  const palette = ['#2A9D8F', '#E76F51', '#E9C46A', '#457B9D', '#9B5DE5', '#F15BB5', '#00BBF9'];
  const circumference = 2 * Math.PI * 30; // r = 30
  let accumulatedPercent = 0;

  // Monthly transactions for recap
  const monthTransactions = state.transactions
    .filter((t) => t.date.startsWith(currentMonth))
    .slice()
    .reverse();

  const displayedTransactions = showAllTransactions
    ? monthTransactions
    : monthTransactions.slice(0, 5);

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-[#1B1B1F]">
      <HudBar />

      <div className="w-full max-w-[720px] px-3 sm:px-6 py-6 space-y-4 flex-1">
        <WoodFrame
          title="TOWN HALL SUMMARY"
          subtitle="Financial diagnostics, civic balance, and town badges"
        >
          <div className="space-y-4">
            {/* Main Action (top, always visible): Four Summary Chips */}
            <div className="bg-[#3A3F47] border-2 border-[#4B515A] p-4">
              <span className="font-['VT323'] text-[20px] text-[#FFF4D6] block mb-2 uppercase">
                Financial Vital Signs
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 bg-[#2E333B] border border-[#4B515A]">
                  <span className="font-['VT323'] text-[16px] text-[#FFF4D6]/70 block uppercase">
                    Cash Balance
                  </span>
                  <span
                    className={`font-['VT323'] text-[24px] ${
                      balance < 0 ? 'text-[#EE6A5E]' : 'text-[#79CE5E]'
                    }`}
                  >
                    ₹{balance.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-2.5 bg-[#2E333B] border border-[#4B515A]">
                  <span className="font-['VT323'] text-[16px] text-[#FFF4D6]/70 block uppercase">
                    Net Savings
                  </span>
                  <span className="font-['VT323'] text-[24px] text-[#FFD95A]">
                    ₹{netSavings.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-2.5 bg-[#2E333B] border border-[#4B515A]">
                  <span className="font-['VT323'] text-[16px] text-[#FFF4D6]/70 block uppercase">
                    Avg Monthly Income
                  </span>
                  <span className="font-['VT323'] text-[24px] text-[#FFF4D6]">
                    ₹{avgMonthlyIncome.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-2.5 bg-[#2E333B] border border-[#4B515A]">
                  <span className="font-['VT323'] text-[16px] text-[#FFF4D6]/70 block uppercase">
                    Savings Cushion
                  </span>
                  <span className="font-['VT323'] text-[24px] text-[#79CE5E]">
                    {savedMonths} mo
                  </span>
                </div>
              </div>
            </div>

            {/* Two Tabs: Summary and Recap & Badges */}
            <div className="flex border-b-2 border-[#4B515A] gap-2 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className={`px-4 py-2 font-['Press_Start_2P'] text-[14px] cursor-pointer transition-colors border-2 ${
                  activeTab === 'summary'
                    ? 'bg-[#382E25] text-[#FFD95A] border-[#FFD95A]'
                    : 'bg-[#2A231D] text-[#FFF4D6] border-[#54433A] hover:bg-[#382E25]'
                }`}
              >
                Summary
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('recap')}
                className={`px-4 py-2 font-['Press_Start_2P'] text-[14px] cursor-pointer transition-colors border-2 ${
                  activeTab === 'recap'
                    ? 'bg-[#382E25] text-[#FFD95A] border-[#FFD95A]'
                    : 'bg-[#2A231D] text-[#FFF4D6] border-[#54433A] hover:bg-[#382E25]'
                }`}
              >
                Recap and Badges
              </button>
            </div>

            {/* Tab 1: Summary */}
            {activeTab === 'summary' && (
              <div className="space-y-4">
                {/* 1. Category Donut Panel */}
                <StonePanel>
                  <button
                    type="button"
                    onClick={() => setOpenDonut(!openDonut)}
                    className="w-full flex items-center justify-between text-left cursor-pointer"
                  >
                    <span className="font-['VT323'] text-[22px] text-[#FFF4D6]">
                      Expense Distribution Donut ({currentMonth})
                    </span>
                    <span className="font-['VT323'] text-[20px] text-[#FFD95A]">
                      {openDonut ? '▼' : '▶'}
                    </span>
                  </button>

                  {openDonut && (
                    <div className="mt-4 pt-4 border-t border-[#4B515A]">
                      {categorySplit.length === 0 ? (
                        <p className="font-['VT323'] text-[20px] text-[#FFF4D6]/70 italic">
                          No expense records found for {currentMonth}.
                        </p>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                          {/* SVG Donut */}
                          <div className="relative w-36 h-36 flex-shrink-0">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                              <circle
                                cx="50"
                                cy="50"
                                r="30"
                                fill="transparent"
                                stroke="#25282E"
                                strokeWidth="16"
                              />
                              {categorySplit.map((c, idx) => {
                                const strokeLength = (c.pct / 100) * circumference;
                                const strokeOffset = -((accumulatedPercent / 100) * circumference);
                                accumulatedPercent += c.pct;
                                return (
                                  <circle
                                    key={c.name}
                                    cx="50"
                                    cy="50"
                                    r="30"
                                    fill="transparent"
                                    stroke={palette[idx % palette.length]}
                                    strokeWidth="16"
                                    strokeDasharray={`${strokeLength} ${circumference}`}
                                    strokeDashoffset={strokeOffset}
                                  />
                                );
                              })}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <span className="font-['VT323'] text-[16px] text-[#FFF4D6]/70">TOTAL</span>
                              <span className="font-['VT323'] text-[20px] text-[#FFD95A]">₹{totalMonthExpense}</span>
                            </div>
                          </div>

                          {/* Legend */}
                          <div className="flex-1 w-full space-y-2">
                            {categorySplit.map((c, idx) => (
                              <div key={c.name} className="flex items-center justify-between font-['VT323'] text-[20px]">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-3.5 h-3.5 inline-block"
                                    style={{ backgroundColor: palette[idx % palette.length] }}
                                  />
                                  <span className="text-[#FFF4D6]">{c.name}</span>
                                </div>
                                <span className="text-[#FFD95A]">
                                  ₹{c.amount.toLocaleString('en-IN')} ({c.pct}%)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </StonePanel>

                {/* 2. Month Bars Panel */}
                <StonePanel>
                  <button
                    type="button"
                    onClick={() => setOpenMonths(!openMonths)}
                    className="w-full flex items-center justify-between text-left cursor-pointer"
                  >
                    <span className="font-['VT323'] text-[22px] text-[#FFF4D6]">
                      Income vs Expenses by Month (Stack Bars)
                    </span>
                    <span className="font-['VT323'] text-[20px] text-[#FFD95A]">
                      {openMonths ? '▼' : '▶'}
                    </span>
                  </button>

                  {openMonths && (
                    <div className="mt-4 pt-4 border-t border-[#4B515A] space-y-3">
                      <p className="font-['VT323'] text-[18px] text-[#FFF4D6]/70">
                        1 block = ₹5,000. Green = Inflow (+₹), Red = Outflow (-₹).
                      </p>

                      {monthBlocks.length === 0 ? (
                        <p className="font-['VT323'] text-[20px] text-[#FFF4D6]/70 italic py-2">
                          No transactions across months logged yet.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {monthBlocks.map((mb) => (
                            <div
                              key={mb.month}
                              className="p-3 bg-[#2E333B] border border-[#4B515A] text-center space-y-2"
                            >
                              <span className="font-['VT323'] text-[20px] text-[#FFD95A] block">
                                {mb.month}
                              </span>

                              <div className="flex items-end justify-center gap-3 h-32 border-b border-[#4B515A] pb-2">
                                <div className="flex flex-col-reverse gap-1 items-center">
                                  {Array.from({ length: mb.incBlocks }).map((_, i) => (
                                    <div
                                      key={i}
                                      className="w-6 h-2.5 bg-[#5DB84A] border border-[#79CE5E]"
                                      title="₹5,000 Income"
                                    />
                                  ))}
                                  <span className="font-['VT323'] text-[16px] text-[#79CE5E]">
                                    +₹{(mb.inc / 1000).toFixed(0)}k
                                  </span>
                                </div>

                                <div className="flex flex-col-reverse gap-1 items-center">
                                  {Array.from({ length: mb.expBlocks }).map((_, i) => (
                                    <div
                                      key={i}
                                      className="w-6 h-2.5 bg-[#B23B3B] border border-[#EE6A5E]"
                                      title="₹5,000 Expense"
                                    />
                                  ))}
                                  <span className="font-['VT323'] text-[16px] text-[#EE6A5E]">
                                    -₹{(mb.exp / 1000).toFixed(0)}k
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </StonePanel>

                {/* 3. Needs vs Wants & Budget Bars Panel */}
                <StonePanel>
                  <button
                    type="button"
                    onClick={() => setOpenBudgets(!openBudgets)}
                    className="w-full flex items-center justify-between text-left cursor-pointer"
                  >
                    <span className="font-['VT323'] text-[22px] text-[#FFF4D6]">
                      Needs vs. Wants & Budget Limits
                    </span>
                    <span className="font-['VT323'] text-[20px] text-[#FFD95A]">
                      {openBudgets ? '▼' : '▶'}
                    </span>
                  </button>

                  {openBudgets && (
                    <div className="mt-4 pt-4 border-t border-[#4B515A] space-y-4">
                      {/* Needs vs Wants Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between font-['VT323'] text-[20px]">
                          <span className="text-[#2A9D8F]">Needs: {needsShare}%</span>
                          <span className="text-[#E76F51]">Wants: {wantsShare}%</span>
                        </div>
                        <div className="w-full h-5 bg-[#1B1B1F] border border-[#4B515A] flex overflow-hidden">
                          <div
                            className="h-full bg-[#2A9D8F] flex items-center justify-center font-['VT323'] text-[16px] text-white"
                            style={{ width: `${needsShare}%` }}
                          >
                            {needsShare > 15 ? `${needsShare}%` : ''}
                          </div>
                          <div
                            className="h-full bg-[#E76F51] flex items-center justify-center font-['VT323'] text-[16px] text-white"
                            style={{ width: `${wantsShare}%` }}
                          >
                            {wantsShare > 15 ? `${wantsShare}%` : ''}
                          </div>
                        </div>
                        <p className="font-['VT323'] text-[18px] text-[#FFF4D6]/70">
                          Rule: Wants should stay at or below 30% of monthly spending.
                        </p>
                      </div>

                      {/* Category Budget Bars */}
                      <div className="space-y-3 pt-2 border-t border-[#4B515A]">
                        <span className="font-['VT323'] text-[20px] text-[#FFD95A] block">
                          Category Budget Progress
                        </span>
                        {budgetStatuses.map((b) => {
                          const barColor =
                            b.status === 'danger'
                              ? 'bg-[#EE6A5E]'
                              : b.status === 'warning'
                              ? 'bg-[#FFD95A]'
                              : 'bg-[#79CE5E]';
                          return (
                            <div key={b.category.id} className="space-y-1">
                              <div className="flex justify-between font-['VT323'] text-[18px]">
                                <span className="text-[#FFF4D6]">{b.category.name}</span>
                                <span className="text-[#FFF4D6]">
                                  ₹{b.spent.toLocaleString('en-IN')} / ₹{(b.category.monthlyLimit || 0).toLocaleString('en-IN')} ({(b.pct * 100).toFixed(0)}%)
                                </span>
                              </div>
                              <div className="w-full h-3 bg-[#1B1B1F] border border-[#4B515A] overflow-hidden">
                                <div
                                  className={`h-full ${barColor}`}
                                  style={{ width: `${Math.min(100, b.pct * 100)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </StonePanel>

                {/* 4. Tips Panel (at most 3) */}
                <StonePanel>
                  <button
                    type="button"
                    onClick={() => setOpenTips(!openTips)}
                    className="w-full flex items-center justify-between text-left cursor-pointer"
                  >
                    <span className="font-['VT323'] text-[22px] text-[#FFF4D6]">
                      Financial Tips & Advisory (Top 3)
                    </span>
                    <span className="font-['VT323'] text-[20px] text-[#FFD95A]">
                      {openTips ? '▼' : '▶'}
                    </span>
                  </button>

                  {openTips && (
                    <div className="mt-4 pt-4 border-t border-[#4B515A] space-y-2">
                      {insightTips.length === 0 ? (
                        <p className="font-['VT323'] text-[20px] text-[#FFF4D6]/70 italic">
                          No alerts right now. Your spending patterns are well balanced!
                        </p>
                      ) : (
                        insightTips.slice(0, 3).map((tip) => (
                          <div
                            key={tip.id}
                            className="p-3 bg-[#2E333B] border-l-4 border-[#FFD95A] space-y-1 font-['VT323']"
                          >
                            <span className="text-[20px] text-[#FFD95A] block">
                              {tip.title}
                            </span>
                            <p className="text-[18px] text-[#FFF4D6]">{tip.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </StonePanel>
              </div>
            )}

            {/* Tab 2: Recap and Badges */}
            {activeTab === 'recap' && (
              <div className="space-y-4">
                {/* Monthly Recap Box */}
                <StonePanel>
                  <span className="font-['VT323'] text-[22px] text-[#FFD95A] block mb-2">
                    Monthly Recap ({currentMonth})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    <div className="p-2 bg-[#2E333B] border border-[#4B515A] text-center font-['VT323']">
                      <span className="text-[16px] text-[#FFF4D6]/70 block">INFLOW</span>
                      <span className="text-[20px] text-[#79CE5E]">₹{totalMonthIncome.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-2 bg-[#2E333B] border border-[#4B515A] text-center font-['VT323']">
                      <span className="text-[16px] text-[#FFF4D6]/70 block">OUTFLOW</span>
                      <span className="text-[20px] text-[#EE6A5E]">₹{totalMonthExpense.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-2 bg-[#2E333B] border border-[#4B515A] text-center font-['VT323']">
                      <span className="text-[16px] text-[#FFF4D6]/70 block">NET SAVED</span>
                      <span className="text-[20px] text-[#FFD95A]">₹{(totalMonthIncome - totalMonthExpense).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-2 bg-[#2E333B] border border-[#4B515A] text-center font-['VT323']">
                      <span className="text-[16px] text-[#FFF4D6]/70 block">SAVINGS RATE</span>
                      <span className="text-[20px] text-[#79CE5E]">{savingsRate}%</span>
                    </div>
                  </div>

                  {/* 5 Latest transactions in recap */}
                  <span className="font-['VT323'] text-[20px] text-[#FFF4D6] block mb-1">
                    Month Transactions
                  </span>
                  {monthTransactions.length === 0 ? (
                    <p className="font-['VT323'] text-[18px] text-[#FFF4D6]/70 italic">
                      No transactions recorded this month.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {displayedTransactions.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-2 bg-[#2E333B] border border-[#4B515A] font-['VT323'] text-[18px]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[#FFF4D6]/70">{t.date}</span>
                            <span className="text-[#FFF4D6]">{t.note || t.categoryId || t.type}</span>
                          </div>
                          <span className={t.type === 'income' ? 'text-[#79CE5E]' : 'text-[#EE6A5E]'}>
                            {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}

                      {monthTransactions.length > 5 && (
                        <div className="pt-2 text-center">
                          <button
                            type="button"
                            onClick={() => setShowAllTransactions(!showAllTransactions)}
                            className="font-['VT323'] text-[18px] text-[#FFD95A] underline hover:text-[#FFE885] cursor-pointer"
                          >
                            {showAllTransactions ? 'Show less' : `Show all (${monthTransactions.length} items)`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </StonePanel>

                {/* Badges Shelf */}
                <StonePanel>
                  <span className="font-['VT323'] text-[22px] text-[#FFD95A] block mb-3">
                    Town Badges Shelf ({state.badges.length}/{BADGE_DEFINITIONS.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BADGE_DEFINITIONS.map((badge) => {
                      const unlocked = state.badges.find((b) => b.id === badge.id);
                      return (
                        <div
                          key={badge.id}
                          className={`p-3 border-2 flex items-start gap-3 ${
                            unlocked
                              ? 'border-[#FFD95A] bg-[#2E2818]'
                              : 'border-[#4B515A] bg-[#25282E] opacity-60'
                          }`}
                        >
                          <div className="text-2xl p-2 bg-[#1B1B1F] border border-[#4B515A]">
                            {badge.icon}
                          </div>
                          <div className="font-['VT323'] flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[20px] text-[#FFD95A]">{badge.name}</span>
                              {unlocked && (
                                <span className="text-[16px] text-[#79CE5E]">UNLOCKED</span>
                              )}
                            </div>
                            <p className="text-[16px] text-[#FFF4D6]/80 leading-tight">
                              {badge.description}
                            </p>
                            {unlocked && (
                              <span className="text-[14px] text-[#FFD95A]/70 block mt-1">
                                Awarded on {unlocked.unlockedDate}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
