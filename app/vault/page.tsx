'use client';

import React, { useState } from 'react';
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
  } = useGame();

  const [activeTab, setActiveTab] = useState<'active' | 'reached'>('active');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAllGoals, setShowAllGoals] = useState(false);

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
          subtitle="Lock in milestones, track dedicated progress, and celebrate accomplishments"
        >
          <div className="space-y-4">
            {/* Main Action (top, always visible): Goal cards with progress + New goal text button */}
            <StonePanel title={`Savings Goals (${activeGoals.length} Active, ${reachedGoals.length} Reached)`}>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-[#4B515A]">
                  <span className="text-[#B4BAC4]">
                    Progress tracks net savings accumulated since goal creation.
                  </span>
                  <button
                    onClick={() => setShowAddGoal(!showAddGoal)}
                    className="text-[14px] text-[#FFD95A] hover:underline cursor-pointer"
                  >
                    {showAddGoal ? '✕ Close form' : '+ New goal'}
                  </button>
                </div>

                {/* Add Goal Drawer */}
                {showAddGoal && (
                  <form onSubmit={handleAddGoal} className="p-3 bg-[#2E333B] border border-[#4B515A] space-y-3">
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
                    <div className="flex justify-end">
                      <PixelButton variant="primary" size="sm" type="submit">
                        Lock in Goal
                      </PixelButton>
                    </div>
                  </form>
                )}
              </div>
            </StonePanel>

            {/* Two Tabs: Tab 1: Active, Tab 2: Reached */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 text-[14px] font-heading cursor-pointer transition-colors ${
                  activeTab === 'active'
                    ? 'bg-[#8B5E34] text-[#FFD95A] border-2 border-[#D9A05E]'
                    : 'bg-[#5C3826] text-[#FFF4D6] border-2 border-[#8B5E34] hover:bg-[#6E442F]'
                }`}
              >
                Active Goals ({activeGoals.length})
              </button>
              <button
                onClick={() => setActiveTab('reached')}
                className={`px-4 py-2 text-[14px] font-heading cursor-pointer transition-colors ${
                  activeTab === 'reached'
                    ? 'bg-[#8B5E34] text-[#FFD95A] border-2 border-[#D9A05E]'
                    : 'bg-[#5C3826] text-[#FFF4D6] border-2 border-[#8B5E34] hover:bg-[#6E442F]'
                }`}
              >
                Reached ({reachedGoals.length})
              </button>
            </div>

            {/* Goal Cards (at most 3 shown at once + 'Show all' text button) */}
            <StonePanel title={activeTab === 'active' ? 'Active Targets' : 'Completed Milestones'}>
              {currentTabGoals.length === 0 ? (
                <p className="text-center italic py-4 text-[#B4BAC4]">
                  {activeTab === 'active'
                    ? 'No active goals in progress. Click "+ New goal" above to start one!'
                    : 'No goals reached yet. Keep building your savings cushion!'}
                </p>
              ) : (
                <div className="space-y-3">
                  {displayedGoals.map((g) => {
                    const { progress, pct, isReached } = calculateGoalProgress(g, state.transactions, today);
                    return (
                      <div
                        key={g.id}
                        className={`p-3 border border-[#4B515A] space-y-2 ${
                          isReached ? 'bg-[#3E3A2C]' : 'bg-[#2E333B]'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <strong className="text-[18px] text-[#FFF4D6] block">
                              {isReached ? '🏆 ' : '🎯 '} {g.name}
                            </strong>
                            <span className="text-xs text-[#B4BAC4]">
                              Created {g.createdDate} {g.reachedDate ? `| Completed ${g.reachedDate}` : ''}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[16px] text-[#FFD95A] font-heading">
                              ₹{progress.toLocaleString('en-IN')} / ₹{g.targetAmount.toLocaleString('en-IN')} ({pct}%)
                            </span>
                            <button
                              onClick={() => deleteGoal(g.id)}
                              className="text-xs text-[#EE6A5E] hover:underline cursor-pointer"
                              title="Delete goal"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-3 bg-[#1B1B1F] border border-[#4B515A] overflow-hidden">
                          <div
                            className={`h-full transition-all ${isReached ? 'bg-[#FFD95A]' : 'bg-[#5DB84A]'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {currentTabGoals.length > 3 && (
                    <div className="text-center pt-1">
                      <button
                        onClick={() => setShowAllGoals(!showAllGoals)}
                        className="text-[14px] text-[#FFD95A] hover:underline cursor-pointer"
                      >
                        {showAllGoals ? 'Show latest 3' : `Show all (${currentTabGoals.length})`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </StonePanel>
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
