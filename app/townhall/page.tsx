'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import { WoodFrame } from '@/components/ui/WoodFrame';
import { StonePanel } from '@/components/ui/StonePanel';
import { PixelButton } from '@/components/ui/PixelButton';
import { RpgTextBox } from '@/components/ui/RpgTextBox';
import { HudBar } from '@/components/ui/HudBar';
import { BADGE_DEFINITIONS } from '@/lib/constants';
import { TOWN_DECORATIONS } from '@/lib/gameplay';
import {
  calculateMonthlySavingsRate,
  calculateWantsShare,
  getCurrentMonthISO,
  getTodayISO,
} from '@/lib/rules';

export default function TownHallPage() {
  const {
    state,
    netSavings,
    avgMonthlyIncome,
    savedMonths,
    insightTips,
    buyDecoration,
    recordBuildingVisit,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'analytics' | 'recap' | 'builder'>('analytics');
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  useEffect(() => {
    recordBuildingVisit('townhall');
  }, [recordBuildingVisit]);

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
    const blockSize = 5000;
    return {
      month: m,
      inc,
      exp,
      incBlocks: inc > 0 ? Math.max(1, Math.round(inc / blockSize)) : 0,
      expBlocks: exp > 0 ? Math.max(1, Math.round(exp / blockSize)) : 0,
    };
  });

  const palette = ['#2A9D8F', '#E76F51', '#E9C46A', '#457B9D', '#9B5DE5', '#F15BB5', '#00BBF9'];
  const circumference = 2 * Math.PI * 30;
  let accumulatedPercent = 0;

  // Monthly transactions for recap
  const monthTransactions = state.transactions
    .filter((t) => t.date.startsWith(currentMonth))
    .slice()
    .reverse();

  const displayedTransactions = showAllTransactions
    ? monthTransactions
    : monthTransactions.slice(0, 3);

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-[#1B1B1F]">
      <HudBar />

      <div className="w-full max-w-[720px] px-3 sm:px-4 py-4 space-y-4 flex-1">
        <WoodFrame
          title="TOWN HALL SUMMARY"
          subtitle="Financial diagnostics, civic balance, and town badges"
        >
          {/* Single Calm Stone Panel with Gold Tab Underline */}
          <StonePanel className="space-y-4">
            {/* Top Non-redundant Financial Vital Signs (16px spacing, clean) */}
            <div className="grid grid-cols-3 gap-2 pb-3 border-b border-[#4B515A]/60 text-center font-sans">
              <div className="p-2 bg-[#2E333B] border border-[#4B515A]">
                <span className="text-[11px] text-[#B4BAC4] block uppercase">Net Savings</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-[#FFD95A]">
                  ₹{netSavings.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-2 bg-[#2E333B] border border-[#4B515A]">
                <span className="text-[11px] text-[#B4BAC4] block uppercase">Avg Income</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-[#FFF4D6]">
                  ₹{avgMonthlyIncome.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-2 bg-[#2E333B] border border-[#4B515A]">
                <span className="text-[11px] text-[#B4BAC4] block uppercase">Cushion</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-[#79CE5E]">
                  {savedMonths} mos
                </span>
              </div>
            </div>

            {/* Tabs with Gold Underline */}
            <div className="flex border-b border-[#4B515A] gap-6 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`pb-1 text-xs sm:text-sm font-heading cursor-pointer transition-colors ${
                  activeTab === 'analytics'
                    ? 'text-[#FFD95A] border-b-2 border-[#FFD95A]'
                    : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
                }`}
              >
                Analytics & Spending
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('recap')}
                className={`pb-1 text-xs sm:text-sm font-heading cursor-pointer transition-colors ${
                  activeTab === 'recap'
                    ? 'text-[#FFD95A] border-b-2 border-[#FFD95A]'
                    : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
                }`}
              >
                Recap & Badges ({state.badges.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('builder')}
                className={`pb-1 text-xs sm:text-sm font-heading cursor-pointer transition-colors ${
                  activeTab === 'builder'
                    ? 'text-[#FFD95A] border-b-2 border-[#FFD95A]'
                    : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
                }`}
              >
                Town Builder 🏛️ ({state.decorations?.length || 0}/4)
              </button>
            </div>

            {/* Tab 1: Analytics & Spending */}
            {activeTab === 'analytics' && (
              <div className="space-y-4 font-sans text-xs sm:text-sm">
                {/* 1. Needs vs Wants 30% Rule */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#2A9D8F] font-bold">Needs: {needsShare}%</span>
                    <span className="text-[#B4BAC4]">Target: Wants &le; 30%</span>
                    <span className="text-[#E76F51] font-bold">Wants: {wantsShare}%</span>
                  </div>
                  <div className="w-full h-3 bg-[#1B1B1F] border border-[#4B515A] flex overflow-hidden">
                    <div className="h-full bg-[#2A9D8F] transition-all" style={{ width: `${needsShare}%` }} />
                    <div className="h-full bg-[#E76F51] transition-all" style={{ width: `${wantsShare}%` }} />
                  </div>
                </div>

                {/* 2. Expense Distribution Donut & Split */}
                <div className="space-y-2 pt-2 border-t border-[#4B515A]/60">
                  <span className="text-xs font-bold text-[#FFD95A] uppercase tracking-wider block">
                    Expense Distribution ({currentMonth})
                  </span>

                  {categorySplit.length === 0 ? (
                    <p className="text-center italic py-2 text-xs text-[#B4BAC4]">
                      No expense records recorded for {currentMonth}.
                    </p>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* SVG Donut */}
                      <div className="relative w-28 h-28 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="30" fill="transparent" stroke="#25282E" strokeWidth="16" />
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
                          <span className="text-[10px] text-[#B4BAC4]">TOTAL</span>
                          <span className="text-xs font-bold font-mono text-[#FFD95A]">₹{totalMonthExpense}</span>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex-1 w-full space-y-1">
                        {categorySplit.map((c, idx) => (
                          <div key={c.name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 inline-block"
                                style={{ backgroundColor: palette[idx % palette.length] }}
                              />
                              <span className="text-[#FFF4D6]">{c.name}</span>
                            </div>
                            <span className="font-mono text-[#FFD95A]">
                              ₹{c.amount.toLocaleString('en-IN')} ({c.pct}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Monthly Stack Bars (Last 3 Months) */}
                {monthBlocks.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#4B515A]/60">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#FFD95A] uppercase tracking-wider">
                        Cash Flow History (1 Block = ₹5k)
                      </span>
                      <span className="text-[11px] text-[#B4BAC4]">Green = Inflow · Red = Outflow</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      {monthBlocks.map((mb) => (
                        <div key={mb.month} className="p-2 bg-[#2E333B] border border-[#4B515A] space-y-1">
                          <span className="text-xs font-bold text-[#FFD95A] block">{mb.month}</span>
                          <div className="flex items-end justify-center gap-2 h-20 border-b border-[#4B515A]/60 pb-1">
                            <div className="flex flex-col-reverse gap-0.5 items-center">
                              {Array.from({ length: Math.min(6, mb.incBlocks) }).map((_, i) => (
                                <div key={i} className="w-4 h-2 bg-[#5DB84A]" />
                              ))}
                              <span className="text-[10px] font-mono text-[#79CE5E]">
                                +₹{(mb.inc / 1000).toFixed(0)}k
                              </span>
                            </div>
                            <div className="flex flex-col-reverse gap-0.5 items-center">
                              {Array.from({ length: Math.min(6, mb.expBlocks) }).map((_, i) => (
                                <div key={i} className="w-4 h-2 bg-[#EE6A5E]" />
                              ))}
                              <span className="text-[10px] font-mono text-[#EE6A5E]">
                                -₹{(mb.exp / 1000).toFixed(0)}k
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Insight Tips (Top 3) */}
                <div className="space-y-2 pt-2 border-t border-[#4B515A]/60">
                  <span className="text-xs font-bold text-[#FFD95A] uppercase tracking-wider block">
                    Top Advisory Insights
                  </span>
                  {insightTips.length === 0 ? (
                    <p className="text-center italic py-2 text-xs text-[#79CE5E]">
                      All financial indicators are healthy and on track!
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {insightTips.slice(0, 3).map((tip) => (
                        <div key={tip.id} className="p-2 bg-[#2E333B] border-l-2 border-[#FFD95A] text-xs space-y-0.5">
                          <strong className="text-[#FFD95A] block">{tip.title}</strong>
                          <p className="text-[#FFF4D6] opacity-90">{tip.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Exactly One Primary Action Button per screen in solid gold */}
                <div className="pt-2">
                  <Link href="/" className="block">
                    <PixelButton variant="primary" size="md" fullWidth>
                      Return to Town Map
                    </PixelButton>
                  </Link>
                </div>
              </div>
            )}

            {/* Tab 2: Monthly Recap & Badges */}
            {activeTab === 'recap' && (
              <div className="space-y-4 font-sans text-xs sm:text-sm">
                {/* Monthly Recap Metrics */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-[#2E333B] border border-[#4B515A]">
                    <span className="text-[10px] text-[#B4BAC4] block uppercase">Inflow</span>
                    <strong className="font-mono text-xs sm:text-sm text-[#79CE5E] block">
                      +₹{totalMonthIncome.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="p-2 bg-[#2E333B] border border-[#4B515A]">
                    <span className="text-[10px] text-[#B4BAC4] block uppercase">Outflow</span>
                    <strong className="font-mono text-xs sm:text-sm text-[#EE6A5E] block">
                      -₹{totalMonthExpense.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="p-2 bg-[#2E333B] border border-[#4B515A]">
                    <span className="text-[10px] text-[#B4BAC4] block uppercase">Net Saved</span>
                    <strong className="font-mono text-xs sm:text-sm text-[#FFD95A] block">
                      ₹{(totalMonthIncome - totalMonthExpense).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="p-2 bg-[#2E333B] border border-[#4B515A]">
                    <span className="text-[10px] text-[#B4BAC4] block uppercase">Rate</span>
                    <strong className="font-mono text-xs sm:text-sm text-[#79CE5E] block">
                      {savingsRate}%
                    </strong>
                  </div>
                </div>

                {/* Transactions in Month (Last 3 items + See all link) */}
                <div className="space-y-2 pt-2 border-t border-[#4B515A]/60">
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-xs font-bold text-[#FFD95A] uppercase tracking-wider">
                      Recent Activity ({currentMonth})
                    </span>
                    {monthTransactions.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setShowAllTransactions(!showAllTransactions)}
                        className="text-xs text-[#D4A373] hover:text-[#FFD95A] underline cursor-pointer"
                      >
                        {showAllTransactions ? 'Show latest 3' : `See all (${monthTransactions.length})`}
                      </button>
                    )}
                  </div>

                  {monthTransactions.length === 0 ? (
                    <p className="text-center italic py-2 text-xs text-[#B4BAC4]">
                      No transactions recorded this month.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {displayedTransactions.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-2 bg-[#2E333B] border border-[#4B515A] text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[#B4BAC4] font-mono text-[11px]">{t.date}</span>
                            <span className="text-[#FFF4D6]">{t.note || t.categoryId || t.type}</span>
                          </div>
                          <span className={`font-mono font-bold ${t.type === 'income' ? 'text-[#79CE5E]' : 'text-[#EE6A5E]'}`}>
                            {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Town Badges Shelf */}
                <div className="space-y-2 pt-2 border-t border-[#4B515A]/60">
                  <span className="text-xs font-bold text-[#FFD95A] uppercase tracking-wider block">
                    Town Badges ({state.badges.length}/{BADGE_DEFINITIONS.length} Earned)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {BADGE_DEFINITIONS.map((badge) => {
                      const unlocked = state.badges.find((b) => b.id === badge.id);
                      return (
                        <div
                          key={badge.id}
                          className={`p-2.5 border flex items-start gap-2.5 ${
                            unlocked
                              ? 'border-[#FFD95A]/60 bg-[#2E2818]'
                              : 'border-[#4B515A]/40 bg-[#25282E] opacity-60'
                          }`}
                        >
                          <span className="text-xl p-1 bg-[#1B1B1F] border border-[#4B515A] flex-shrink-0">
                            {badge.icon}
                          </span>
                          <div className="text-xs flex-1">
                            <div className="flex items-center justify-between">
                              <strong className="text-[#FFD95A]">{badge.name}</strong>
                              {unlocked && <span className="text-[#79CE5E] text-[10px] font-bold">EARNED</span>}
                            </div>
                            <p className="text-[#FFF4D6] opacity-80 text-[11px] leading-tight mt-0.5">
                              {badge.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Exactly One Primary Action Button per screen in solid gold */}
                <div className="pt-2">
                  <Link href="/" className="block">
                    <PixelButton variant="primary" size="md" fullWidth>
                      Return to Town Map
                    </PixelButton>
                  </Link>
                </div>
              </div>
            )}

            {/* Tab 3: Town Builder & Civic Projects */}
            {activeTab === 'builder' && (
              <div className="space-y-4 font-sans text-xs sm:text-sm">
                {/* Renown Header Card */}
                <div className="p-3 bg-[#1B1B1F] border-2 border-[#B79A60] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#B4BAC4] uppercase font-bold tracking-wider block">
                      Civic Treasury
                    </span>
                    <span className="text-sm sm:text-base font-bold font-heading text-[#FFD95A] flex items-center gap-1.5">
                      <span>⭐</span>
                      <span>{state.renown ?? 0} Renown</span>
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-[#FFF4D6]/80 max-w-[200px]">
                    Earn +15 Renown on every transaction, School quiz, and bounty!
                  </div>
                </div>

                {/* Description Banner */}
                <div className="p-2.5 bg-[#25282E] border border-[#4B515A] text-xs text-[#FFF4D6] space-y-1">
                  <span className="text-[#FFD95A] font-bold block">
                    🏛️ Civic Architectural Projects
                  </span>
                  <p className="text-[#B4BAC4] text-[11px] leading-relaxed">
                    Build permanent isometric monuments on your island. Every decoration enhances town prestige, makes Sheru happier, and reflects your real-world financial mastery!
                  </p>
                </div>

                {/* Decorations List */}
                <div className="space-y-2.5">
                  {TOWN_DECORATIONS.map((deco) => {
                    const isBuilt = state.decorations?.includes(deco.id);
                    const canAfford = (state.renown ?? 0) >= deco.costRenown;

                    return (
                      <div
                        key={deco.id}
                        className={`p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isBuilt
                            ? 'border-[#79CE5E]/60 bg-[#1D2A1C]'
                            : canAfford
                            ? 'border-[#FFD95A]/60 bg-[#25282E]'
                            : 'border-[#4B515A]/40 bg-[#1B1B1F] opacity-75'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl p-2 bg-[#121316] border border-[#4B515A] shrink-0">
                            {deco.icon}
                          </span>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-heading text-xs sm:text-sm text-[#FFD95A]">
                                {deco.name}
                              </span>
                              {isBuilt && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#79CE5E]/20 text-[#79CE5E] border border-[#79CE5E]/60">
                                  BUILT ✓
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#B4BAC4] leading-relaxed">
                              {deco.desc}
                            </p>
                            <span className="text-[10px] text-[#FFD95A] font-mono block">
                              Cost: ⭐ {deco.costRenown} Renown
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 sm:self-center">
                          {isBuilt ? (
                            <span className="text-xs font-bold text-[#79CE5E] flex items-center gap-1">
                              <span>✓</span> Active in Town
                            </span>
                          ) : (
                            <PixelButton
                              variant={canAfford ? 'primary' : 'stone'}
                              size="sm"
                              disabled={!canAfford}
                              onClick={() => buyDecoration(deco.id)}
                            >
                              {canAfford
                                ? `Build (${deco.costRenown} ⭐)`
                                : `Need ${deco.costRenown - (state.renown ?? 0)} ⭐`}
                            </PixelButton>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <Link href="/" className="block">
                    <PixelButton variant="wood" size="md" fullWidth>
                      Return to Town Map
                    </PixelButton>
                  </Link>
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
