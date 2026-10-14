import { GameState } from './types';
import {
  calculateBalance,
  calculateAvgMonthlyIncome,
  calculateMonthlySavingsRate,
  calculateWantsShare,
  getCategoryBudgetStatuses,
  calculateLoanSummary,
  getCurrentMonthISO,
  getTodayISO,
} from './rules';

export interface InsightTip {
  id: number;
  type: 'alert' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
}

export function getInsightTips(state: GameState, todayStr?: string): InsightTip[] {
  const today = todayStr || getTodayISO();
  const currentMonth = getCurrentMonthISO(today);
  const tips: InsightTip[] = [];

  const balance = calculateBalance(
    state.profile?.openingBalance || 0,
    state.transactions,
    today
  );
  const avgIncome = calculateAvgMonthlyIncome(state.transactions, today);
  const savingsRate = calculateMonthlySavingsRate(state.transactions, currentMonth);
  const wantsShare = calculateWantsShare(state.transactions, currentMonth);
  const budgetStatuses = getCategoryBudgetStatuses(
    state.categories,
    state.transactions,
    currentMonth
  );

  // 1. Any category at 100%+ of its limit
  const redCategories = budgetStatuses.filter((b) => b.status === 'danger');
  if (redCategories.length > 0) {
    const firstRed = redCategories[0];
    tips.push({
      id: 1,
      type: 'alert',
      title: 'Budget Alert',
      message: `${firstRed.category.name} has exceeded its monthly limit (₹${firstRed.spent.toLocaleString('en-IN')} / ₹${firstRed.limit.toLocaleString('en-IN')}). Consider pausing extra spending here.`,
    });
  }

  // 2. EMI-to-income above 40%
  if (state.loan && state.loan.active && avgIncome > 0) {
    const loanSummary = calculateLoanSummary(
      state.loan.principal,
      state.loan.annualRatePct,
      state.loan.months,
      avgIncome
    );
    if (loanSummary.emiToIncome > 0.4) {
      tips.push({
        id: 2,
        type: 'alert',
        title: 'Heavy Debt Load',
        message: `Your monthly EMI of ₹${loanSummary.emi.toLocaleString('en-IN')} is ${(loanSummary.emiToIncome * 100).toFixed(0)}% of your monthly income (recommended: under 40%).`,
      });
    }
  }

  // 3. Monthly savings rate below 10%
  const monthTransactions = state.transactions.filter((t) =>
    t.date.startsWith(currentMonth)
  );
  const hasMonthIncome = monthTransactions.some((t) => t.type === 'income');
  if (hasMonthIncome && savingsRate < 0.1 && savingsRate >= 0) {
    tips.push({
      id: 3,
      type: 'warning',
      title: 'Low Savings Rate',
      message: `You are saving ${(savingsRate * 100).toFixed(1)}% of your income this month. Aim to save at least 10–20% before other expenses.`,
    });
  }

  // 4. Wants above 30% of spending
  if (wantsShare > 0.3) {
    tips.push({
      id: 4,
      type: 'warning',
      title: 'Wants Creeping Up',
      message: `Wants account for ${(wantsShare * 100).toFixed(0)}% of this month's spending. The 50/30/20 benchmark suggests keeping discretionary wants under 30%.`,
    });
  }

  // 5. One category above 35% of spending
  let totalMonthExpense = 0;
  const categoryExpenses: Record<string, number> = {};
  for (const t of monthTransactions) {
    if (t.type === 'expense') {
      totalMonthExpense += t.amount;
      const catId = t.categoryId || 'unknown';
      categoryExpenses[catId] = (categoryExpenses[catId] || 0) + t.amount;
    }
  }
  if (totalMonthExpense > 0) {
    for (const [catId, spent] of Object.entries(categoryExpenses)) {
      const share = spent / totalMonthExpense;
      if (share > 0.35) {
        const catName =
          state.categories.find((c) => c.id === catId)?.name || 'Category';
        tips.push({
          id: 5,
          type: 'info',
          title: 'High Category Concentration',
          message: `${catName} represents ${(share * 100).toFixed(0)}% of your total spending this month (₹${spent.toLocaleString('en-IN')}).`,
        });
        break; // only report top one
      }
    }
  }

  // 6. Balance under one month of average expenses
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
  if (avgMonthlyExpense > 0 && balance < avgMonthlyExpense && balance > 0) {
    tips.push({
      id: 6,
      type: 'warning',
      title: 'Slim Emergency Buffer',
      message: `Your current cash balance of ₹${balance.toLocaleString('en-IN')} is less than 1 month of average expenses (₹${Math.round(avgMonthlyExpense).toLocaleString('en-IN')}).`,
    });
  }

  // 7. No income logged this month
  if (!hasMonthIncome) {
    tips.push({
      id: 7,
      type: 'info',
      title: 'No Income Logged',
      message: `No earnings recorded for ${currentMonth} yet. Remember to log your salary, freelancing, or side-hustle revenue.`,
    });
  }

  // 8. Savings rate 20% or more (praise)
  if (savingsRate >= 0.2) {
    tips.push({
      id: 8,
      type: 'success',
      title: 'Strong Savings Habit',
      message: `Incredible work! You are saving ${(savingsRate * 100).toFixed(0)}% of your earnings this month. Your future self thanks you.`,
    });
  }

  // Return up to 3 tips
  return tips.slice(0, 3);
}
