import { GameState, Lesson } from './types';
import { LESSONS } from './constants';
import {
  calculateBalance,
  calculateAvgMonthlyIncome,
  calculateMonthlySavingsRate,
  calculateWantsShare,
  calculateLevel,
  calculateSavedMonths,
  calculateNetSavings,
  calculateStreak,
  getCurrentMonthISO,
  getTodayISO,
} from './rules';
import { evaluateEvents } from './events';

export function checkLessonTriggers(
  state: GameState,
  todayStr?: string
): number[] {
  const today = todayStr || getTodayISO();
  const currentMonth = getCurrentMonthISO(today);
  const seenIds = new Set(state.lessonsSeen.map((l) => l.lessonId));
  const newlyTriggered: number[] = [];

  const balance = calculateBalance(
    state.profile?.openingBalance || 0,
    state.transactions,
    today
  );
  const netSavings = calculateNetSavings(state.transactions, today);
  const avgIncome = calculateAvgMonthlyIncome(state.transactions, today);
  const savedMonths = calculateSavedMonths(netSavings, avgIncome);
  const level = calculateLevel(savedMonths);
  const streak = calculateStreak(state.transactions, today);
  const savingsRate = calculateMonthlySavingsRate(state.transactions, currentMonth);
  const wantsShare = calculateWantsShare(state.transactions, currentMonth);
  const event = evaluateEvents(state, today);

  const hasAnyIncome = state.transactions.some((t) => t.type === 'income');
  const hasGoals = state.goals.length > 0;
  const hasReachedGoal = state.goals.some((g) => g.reachedDate);
  const hasRecurring = state.recurring.length > 0;

  // Average monthly expenses
  let totalExpenses = 0;
  const expenseMonths = new Set<string>();
  for (const t of state.transactions) {
    if (t.type === 'expense' && t.date <= today) {
      totalExpenses += t.amount;
      expenseMonths.add(t.date.slice(0, 7));
    }
  }
  const avgMonthlyExpense =
    expenseMonths.size > 0 ? totalExpenses / expenseMonths.size : 0;

  // Lesson 1: Pay Yourself First -> First income logged; or savings rate < 10%
  if (!seenIds.has(1) && (hasAnyIncome || (savingsRate < 0.1 && hasAnyIncome))) {
    newlyTriggered.push(1);
  }

  // Lesson 2: Assets vs Liabilities -> Loan taken
  if (!seenIds.has(2) && state.loan && state.loan.active) {
    newlyTriggered.push(2);
  }

  // Lesson 3: Wants Add Up -> Wants above 30% of a month's spending
  if (!seenIds.has(3) && wantsShare > 0.3) {
    newlyTriggered.push(3);
  }

  // Lesson 4: Know Your Enough -> First promotion (level > 1)
  if (!seenIds.has(4) && level > 1) {
    newlyTriggered.push(4);
  }

  // Lesson 5: Margin of Safety -> Stranded, or balance below 1 month of avg expenses
  if (
    !seenIds.has(5) &&
    (event.type === 'stranded' || (avgMonthlyExpense > 0 && balance < avgMonthlyExpense))
  ) {
    newlyTriggered.push(5);
  }

  // Lesson 6: Tiny Habits -> First goal created, or 7-day streak
  if (!seenIds.has(6) && (hasGoals || streak >= 7)) {
    newlyTriggered.push(6);
  }

  // Lesson 7: Systems Beat Goals -> First recurring entry, or goal reached
  if (!seenIds.has(7) && (hasRecurring || hasReachedGoal)) {
    newlyTriggered.push(7);
  }

  // Lesson 8: Interest Cuts Both Ways -> Debt spiral
  if (!seenIds.has(8) && event.type === 'debt_spiral') {
    newlyTriggered.push(8);
  }

  return newlyTriggered;
}

export function getLessonById(id: number): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
