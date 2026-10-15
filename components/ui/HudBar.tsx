'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import { CoinIcon, HeartIcon, GearIcon } from './PixelIcons';
import { calculateGoalProgress, calculateMonthlySavingsRate, getCurrentMonthISO, getTodayISO } from '@/lib/rules';
import { isSoundMuted, setSoundMuted } from '@/lib/sound';

export function HudBar() {
  const {
    state,
    balance,
    levelTitle,
    budgetStatuses,
    setTheme,
  } = useGame();

  const [muted, setMuted] = useState(isSoundMuted());

  const toggleSound = () => {
    const next = !muted;
    setSoundMuted(next);
    setMuted(next);
  };

  const name = state.profile?.name || 'Hero';
  const theme = state.profile?.theme || 'system';

  // Savings rate this month
  const today = getTodayISO();
  const currentMonth = getCurrentMonthISO(today);
  const savingsRate = Math.round(
    calculateMonthlySavingsRate(state.transactions, currentMonth) * 100
  );

  // Active goal
  const activeGoal = state.goals.find((g) => !g.reachedDate) || state.goals[0];
  const goalProgress = activeGoal
    ? calculateGoalProgress(activeGoal, state.transactions, today)
    : null;

  // Budget status counts
  const hasDanger = budgetStatuses.some((b) => b.status === 'danger');
  const hasWarning = budgetStatuses.some((b) => b.status === 'warning');

  const toggleTheme = () => {
    const nextTheme = theme === 'night' ? 'day' : 'night';
    setTheme(nextTheme);
  };

  return (
    <header className="w-full bg-[#15161A] border-b-2 border-[#5C3826] px-3 py-1.5 min-h-[40px] flex flex-nowrap items-center justify-between gap-2 sm:gap-4 text-xs sm:text-sm select-none z-30 shadow-md overflow-x-auto whitespace-nowrap">
      {/* Left: Name and Title with min-width and ellipsis truncation */}
      <div className="flex items-center gap-2 font-heading min-w-[140px] sm:min-w-[170px] flex-shrink-0">
        <span className="text-[#FFD95A] truncate max-w-[80px] sm:max-w-[120px] inline-block" title={name}>
          {name}
        </span>
        <span className="text-[#B4BAC4] text-[10px] sm:text-xs bg-[#2E333B] px-1.5 py-0.5 border border-[#4E5561] flex-shrink-0">
          {levelTitle}
        </span>
      </div>

      {/* Middle: Coin Balance, Savings Heart, and Goal Progress */}
      <div className="flex items-center gap-2 sm:gap-4 font-body text-base sm:text-lg flex-shrink-0 min-w-[260px] sm:min-w-[340px] justify-center">
        {/* Coin + Balance */}
        <div className="flex items-center gap-1.5 bg-[#25282E] px-2.5 py-0.5 border border-[#4E5561] min-w-[100px] justify-center flex-shrink-0">
          <CoinIcon size={16} />
          <span
            className={`font-heading text-xs sm:text-sm ${
              balance < 0 ? 'text-[#EE6A5E]' : 'text-[#FFF4D6]'
            }`}
          >
            ₹{balance.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Heart + Monthly Savings Rate */}
        <div
          className="flex items-center gap-1 bg-[#25282E] px-2.5 py-0.5 border border-[#4E5561] min-w-[65px] justify-center flex-shrink-0"
          title="Monthly Savings Rate"
        >
          <HeartIcon size={14} />
          <span className="font-heading text-xs">
            {savingsRate >= 0 ? `${savingsRate}%` : '0%'}
          </span>
        </div>

        {/* Goal Progress Mini Bar */}
        {activeGoal && goalProgress && (
          <Link
            href="/vault"
            className="hidden md:flex items-center gap-2 bg-[#25282E] px-2.5 py-0.5 border border-[#4E5561] hover:border-[#FFD95A] transition-colors min-w-[140px] flex-shrink-0"
            title={`Goal: ${activeGoal.name}`}
          >
            <span className="text-xs text-[#FFF4D6] truncate max-w-[80px]">
              {activeGoal.name}
            </span>
            <div className="w-16 h-2.5 bg-[#1B1B1F] border border-[#5E6675] overflow-hidden">
              <div
                className="h-full bg-[#FFD95A]"
                style={{ width: `${goalProgress.pct}%` }}
              />
            </div>
            <span className="text-[10px] font-heading text-[#FFD95A]">
              {goalProgress.pct}%
            </span>
          </Link>
        )}

        {/* Budget Status Dots */}
        <Link
          href="/market"
          className="flex items-center gap-1 bg-[#25282E] px-2 py-1 border border-[#4E5561] hover:border-[#FFD95A] flex-shrink-0"
          title="Budget Health"
        >
          <div
            className={`w-2.5 h-2.5 ${
              hasDanger
                ? 'bg-[#EE6A5E] animate-pulse'
                : hasWarning
                ? 'bg-[#F4B63A]'
                : 'bg-[#5DB84A]'
            }`}
          />
          <span className="text-[10px] font-heading hidden sm:inline text-[#B4BAC4]">
            BUDGETS
          </span>
        </Link>
      </div>

      {/* Right: Audio, Day/Night Toggle & Settings */}
      <div className="flex items-center gap-2 min-w-[140px] sm:min-w-[170px] flex-shrink-0 justify-end">
        <button
          onClick={toggleSound}
          className="px-2 py-1 bg-[#2E333B] border border-[#4E5561] hover:border-[#FFD95A] text-xs font-heading cursor-pointer text-[#FFF4D6]"
          title={muted ? 'Unmute 8-bit sound' : 'Mute 8-bit sound'}
        >
          {muted ? '🔇 MUTE' : '🔊 SFX'}
        </button>

        <button
          onClick={toggleTheme}
          className="px-2 py-1 bg-[#2E333B] border border-[#4E5561] hover:border-[#FFD95A] text-xs font-heading cursor-pointer text-[#FFF4D6]"
          title="Toggle Day/Night Mode"
        >
          {theme === 'night' ? '🌙 NIGHT' : '☀️ DAY'}
        </button>

        <Link
          href="/settings"
          className="p-1.5 bg-[#2E333B] border border-[#4E5561] hover:border-[#FFD95A] text-[#FFF4D6] transition-colors"
          title="Settings"
        >
          <GearIcon size={14} />
        </Link>
      </div>
    </header>
  );
}
