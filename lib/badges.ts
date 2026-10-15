import { GameState, Badge } from './types';
import {
  calculateBalance,
  calculateNetSavings,
  calculateStreak,
  calculateLevel,
  calculateSavedMonths,
  calculateAvgMonthlyIncome,
  getCategoryBudgetStatuses,
  calculateWantsShare,
  getTodayISO,
} from './rules';

export function checkBadgeUnlocks(
  state: GameState,
  todayStr?: string
): Badge[] {
  const today = todayStr || getTodayISO();
  const existingBadgeIds = new Set(state.badges.map((b) => b.id));
  const newBadges: Badge[] = [];

  const unlock = (id: string) => {
    if (!existingBadgeIds.has(id)) {
      newBadges.push({ id, unlockedDate: today });
      existingBadgeIds.add(id);
    }
  };

  const netSavings = calculateNetSavings(state.transactions, today);
  const avgIncome = calculateAvgMonthlyIncome(state.transactions, today);
  const savedMonths = calculateSavedMonths(netSavings, avgIncome);
  const level = calculateLevel(savedMonths);
  const streak = calculateStreak(state.transactions, today);

  // 1. First Step: at least 1 transaction
  if (state.transactions.length > 0) {
    unlock('first_step');
  }

  // 2. First ₹1,000 net savings
  if (netSavings >= 1000) {
    unlock('first_1k');
  }

  // 3. Week Streak (7 days)
  if (streak >= 7) {
    unlock('week_streak');
  }

  // 4. Habit Builder (30 days)
  if (streak >= 30) {
    unlock('habit_builder');
  }

  // 5. Goal Getter: at least 1 goal reached
  if (state.goals.some((g) => g.reachedDate)) {
    unlock('goal_getter');
  }

  // 6. Rising Star: Level 3
  if (level >= 3) {
    unlock('rising_star');
  }

  // 7. Summit: Level 5
  if (level >= 5) {
    unlock('summit');
  }

  // 8. Loan Cleared: loan exists, is inactive (cleared), with > 0 loan transactions
  const hasLoanTx = state.transactions.some((t) => t.source === 'loan');
  if (state.loan && !state.loan.active && hasLoanTx) {
    unlock('loan_cleared');
  }

  // 9. Budget Keeper & Need-Want Master (evaluate for prior calendar months)
  const uniqueMonths = Array.from(
    new Set(state.transactions.map((t) => t.date.slice(0, 7)))
  ).filter((m) => m < today.slice(0, 7)); // completed past months only

  for (const m of uniqueMonths) {
    // Check Budget Keeper
    const statuses = getCategoryBudgetStatuses(state.categories, state.transactions, m);
    if (statuses.length > 0 && statuses.every((s) => s.status !== 'danger')) {
      unlock('budget_keeper');
    }

    // Check Need-Want Master
    const monthExpenses = state.transactions.filter(
      (t) => t.date.startsWith(m) && t.type === 'expense'
    );
    if (monthExpenses.length > 0) {
      const wantsShare = calculateWantsShare(state.transactions, m);
      if (wantsShare <= 0.3) {
        unlock('need_want_master');
      }
    }
  }

  // 10. Comeback Kid: climbed out of stranded or debt spiral
  const currentBal = calculateBalance(state.profile?.openingBalance || 0, state.transactions, today);
  let runningBal = state.profile?.openingBalance || 0;
  let hadNegativeBal = runningBal <= 0;
  const sortedTx = [...state.transactions].sort((a, b) => a.date.localeCompare(b.date));
  for (const t of sortedTx) {
    runningBal += t.type === 'income' ? t.amount : -t.amount;
    if (runningBal <= 0) {
      hadNegativeBal = true;
    }
  }
  if (hadNegativeBal && currentBal > 0) {
    unlock('comeback_kid');
  }

  return newBadges;
}
