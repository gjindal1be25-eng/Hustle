'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { WoodFrame } from '@/components/ui/WoodFrame';
import { StonePanel } from '@/components/ui/StonePanel';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelInput } from '@/components/ui/PixelInput';
import { RpgTextBox } from '@/components/ui/RpgTextBox';
import { HudBar } from '@/components/ui/HudBar';
import { calculateGoalProgress, getTodayISO } from '@/lib/rules';

export default function VaultPage() {
  const {
    state,
    addGoal,
    deleteGoal,
    recordBuildingVisit,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'active' | 'reached'>('active');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAllGoals, setShowAllGoals] = useState(false);

  useEffect(() => {
    recordBuildingVisit('vault');
  }, [recordBuildingVisit]);

  const [name, setName] = useState<string>('');
  const [targetAmount, setTargetAmount] = useState<string>('');

  const today = getTodayISO();

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    if (!name.trim() || isNaN(target) || target <= 0) return;

    addGoal(name.trim(), target);
    setName('');
    setTargetAmount('');
    setShowAddGoal(false);
  };

  const activeGoals = state.goals.filter((g) => {
    const { isReached } = calculateGoalProgress(g, state.transactions, today);
    return !isReached && !g.reachedDate;
  });

  const reachedGoals = state.goals.filter((g) => {
    const { isReached } = calculateGoalProgress(g, state.transactions, today);
    return isReached || !!g.reachedDate;
  });

  const currentTabGoals = activeTab === 'active' ? activeGoals : reachedGoals;
  const displayedGoals = showAllGoals ? currentTabGoals : currentTabGoals.slice(0, 3);

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-[#1B1B1F]">
      <HudBar />

      <div className="w-full max-w-[720px] px-3 sm:px-4 py-4 space-y-4 flex-1">
        <WoodFrame
          title="TOWN VAULT & SAVINGS GOALS"
          subtitle="Lock in financial milestones, track dedicated progress, and celebrate accomplishments"
        >
          {/* Single Calm Stone Panel with Gold Tab Underline */}
          <StonePanel className="space-y-4">
            {/* Top Section: Goal Form Toggle or Active Form */}
            <div className="space-y-3 pb-3 border-b border-[#4B515A]/60">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-sans font-bold text-[#FFD95A] uppercase tracking-wider">
                  Create New Savings Target
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddGoal(!showAddGoal)}
                  className="text-xs text-[#D4A373] hover:text-[#FFD95A] underline cursor-pointer"
                >
                  {showAddGoal ? 'Cancel form' : '+ New goal'}
                </button>
              </div>

              {showAddGoal ? (
                <form onSubmit={handleAddGoal} className="space-y-3 font-sans text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <PixelInput
                      label="Goal Name"
                      placeholder="e.g. Emergency Cushion, Laptop..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <PixelInput
                      label="Target Amount (₹)"
                      prefix="₹"
                      type="number"
                      min="500"
                      step="500"
                      placeholder="e.g. 50000"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      required
                    />
                  </div>

                  {/* Exactly One Primary Action Button in solid gold */}
                  <div className="pt-1">
                    <PixelButton variant="primary" size="md" type="submit" fullWidth>
                      Lock in Goal
                    </PixelButton>
                  </div>
                </form>
              ) : (
                <p className="text-xs text-[#B4BAC4] leading-relaxed">
                  Progress calculates cumulative net savings deposited since goal creation. Click &ldquo;+ New goal&rdquo; above to lock in a new milestone.
                </p>
              )}
            </div>

            {/* Tabs with Gold Underline */}
            <div className="flex border-b border-[#4B515A] gap-6 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className={`pb-1 text-xs sm:text-sm font-heading cursor-pointer transition-colors ${
                  activeTab === 'active'
                    ? 'text-[#FFD95A] border-b-2 border-[#FFD95A]'
                    : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
                }`}
              >
                Active Goals ({activeGoals.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reached')}
                className={`pb-1 text-xs sm:text-sm font-heading cursor-pointer transition-colors ${
                  activeTab === 'reached'
                    ? 'text-[#FFD95A] border-b-2 border-[#FFD95A]'
                    : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
                }`}
              >
                Reached ({reachedGoals.length})
              </button>
            </div>

            {/* Goal Cards List (Last 3 items + See all link) */}
            <div className="space-y-3 font-sans text-xs sm:text-sm">
              <div className="flex justify-between items-center pb-1">
                <span className="text-xs text-[#B4BAC4] uppercase tracking-wider">
                  {activeTab === 'active' ? 'Active Targets' : 'Completed Milestones'}
                </span>
                {currentTabGoals.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllGoals(!showAllGoals)}
                    className="text-xs text-[#D4A373] hover:text-[#FFD95A] underline cursor-pointer"
                  >
                    {showAllGoals ? 'Show latest 3' : `See all (${currentTabGoals.length})`}
                  </button>
                )}
              </div>

              {currentTabGoals.length === 0 ? (
                <p className="text-center italic py-4 text-xs text-[#B4BAC4]">
                  {activeTab === 'active'
                    ? 'No active targets. Click "+ New goal" above to start one!'
                    : 'No goals reached yet. Keep building your savings cushion!'}
                </p>
              ) : (
                <div className="space-y-3">
                  {displayedGoals.map((g) => {
                    const { progress, pct, isReached } = calculateGoalProgress(g, state.transactions, today);
                    return (
                      <div
                        key={g.id}
                        className="space-y-1.5 pb-2.5 border-b border-[#4B515A]/40"
                      >
                        <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm gap-2">
                          <div>
                            <strong className="text-[#FFF4D6]">
                              {isReached ? '🏆 ' : '🎯 '} {g.name}
                            </strong>
                            <span className="text-[11px] text-[#B4BAC4] block">
                              Created {g.createdDate} {g.reachedDate ? `· Completed ${g.reachedDate}` : ''}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs sm:text-sm text-[#FFD95A]">
                              ₹{progress.toLocaleString('en-IN')} / ₹{g.targetAmount.toLocaleString('en-IN')} ({pct}%)
                            </span>
                            <button
                              type="button"
                              onClick={() => deleteGoal(g.id)}
                              className="text-xs text-[#EE6A5E] hover:underline cursor-pointer"
                              title="Delete goal"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Clean Progress Bar */}
                        <div className="w-full h-2.5 bg-[#1B1B1F] border border-[#4B515A] overflow-hidden">
                          <div
                            className={`h-full transition-all ${isReached ? 'bg-[#FFD95A]' : 'bg-[#5DB84A]'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* If add goal form is not open and active goals exist, provide a primary gold button to open form or town */}
              {!showAddGoal && (
                <div className="pt-2">
                  <PixelButton
                    variant="primary"
                    size="md"
                    onClick={() => setShowAddGoal(true)}
                    fullWidth
                  >
                    + Create New Goal
                  </PixelButton>
                </div>
              )}
            </div>
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
