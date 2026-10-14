import {
  Transaction,
  Goal,
  Category,
  CategoryBudgetStatus,
  LoanSummary,
  CareerPath,
} from './types';
import { LEVEL_THRESHOLDS, CAREER_TITLES } from './constants';

export function getTodayISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthISO(dateStr?: string): string {
  const base = dateStr || getTodayISO();
  return base.slice(0, 7); // yyyy-mm
}

export function calculateBalance(
  openingBalance: number,
  transactions: Transaction[],
  upToDate?: string
): number {
  const limitDate = upToDate || getTodayISO();
  let total = openingBalance;
  for (const t of transactions) {
    if (t.date <= limitDate) {
      if (t.type === 'income') total += t.amount;
      else if (t.type === 'expense') total -= t.amount;
    }
  }
  return total;
}

export function calculateNetSavings(
  transactions: Transaction[],
  upToDate?: string
): number {
  const limitDate = upToDate || getTodayISO();
  let net = 0;
  for (const t of transactions) {
    if (t.date <= limitDate) {
      if (t.type === 'income') net += t.amount;
      else if (t.type === 'expense') net -= t.amount;
    }
  }
  return net;
}

export function calculateAvgMonthlyIncome(
  transactions: Transaction[],
  upToDate?: string
): number {
  const limitDate = upToDate || getTodayISO();
  let totalIncome = 0;
  const incomeMonths = new Set<string>();

  for (const t of transactions) {
    if (t.date <= limitDate && t.type === 'income' && t.amount > 0) {
      totalIncome += t.amount;
      incomeMonths.add(t.date.slice(0, 7));
    }
  }

  if (totalIncome <= 0) return 0;
  const monthsCount = Math.max(1, incomeMonths.size);
  return Math.round(totalIncome / monthsCount);
}

export function calculateSavedMonths(
  netSavings: number,
  avgMonthlyIncome: number
): number {
  if (avgMonthlyIncome <= 0) return 0;
  const raw = netSavings / avgMonthlyIncome;
  return Number(raw.toFixed(2));
}

export function calculateMonthlySavingsRate(
  transactions: Transaction[],
  monthStr: string
): number {
  let monthIncome = 0;
  let monthExpense = 0;

  for (const t of transactions) {
    if (t.date.startsWith(monthStr)) {
      if (t.type === 'income') monthIncome += t.amount;
      else if (t.type === 'expense') monthExpense += t.amount;
    }
  }

  if (monthIncome <= 0) return 0;
  const rate = (monthIncome - monthExpense) / monthIncome;
  return Number(rate.toFixed(3));
}

export function calculateWantsShare(
  transactions: Transaction[],
  monthStr: string
): number {
  let totalExpense = 0;
  let wantExpense = 0;

  for (const t of transactions) {
    if (t.date.startsWith(monthStr) && t.type === 'expense') {
      totalExpense += t.amount;
      if (t.tag === 'want') {
        wantExpense += t.amount;
      }
    }
  }

  if (totalExpense <= 0) return 0;
  return Number((wantExpense / totalExpense).toFixed(3));
}

export function calculateEMI(
  principal: number,
  annualRatePct: number,
  months: number
): number {
  if (months <= 0 || principal <= 0) return 0;
  if (annualRatePct <= 0) {
    return Math.round(principal / months);
  }
  const r = annualRatePct / 12 / 100;
  const factor = Math.pow(1 + r, months);
  const emi = (principal * r * factor) / (factor - 1);
  return Math.round(emi);
}

export function calculateLoanSummary(
  principal: number,
  annualRatePct: number,
  months: number,
  avgMonthlyIncome: number
): LoanSummary {
  const emi = calculateEMI(principal, annualRatePct, months);
  const totalPayable = emi * months;
  const totalInterest = Math.max(0, totalPayable - principal);
  const emiToIncome = avgMonthlyIncome > 0 ? Number((emi / avgMonthlyIncome).toFixed(3)) : 0;

  return {
    emi,
    totalInterest,
    totalPayable,
    emiToIncome,
  };
}

export function calculateGoalProgress(
  goal: Goal,
  transactions: Transaction[],
  upToDate?: string
): { progress: number; pct: number; isReached: boolean } {
  const limitDate = upToDate || getTodayISO();
  let netSince = 0;

  for (const t of transactions) {
    if (t.date >= goal.createdDate && t.date <= limitDate) {
      if (t.type === 'income') netSince += t.amount;
      else if (t.type === 'expense') netSince -= t.amount;
    }
  }

  const progress = Math.min(goal.targetAmount, Math.max(0, netSince));
  const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((progress / goal.targetAmount) * 100)) : 0;
  const isReached = progress >= goal.targetAmount;

  return { progress, pct, isReached };
}

export function calculateLevel(savedMonths: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    const t = LEVEL_THRESHOLDS[i];
    if (savedMonths >= t.minSavedMonths) {
      return t.level;
    }
  }
  return 1;
}

export function getLevelTitle(level: number, path: CareerPath): string {
  const clampedLevel = Math.max(1, Math.min(5, level));
  return CAREER_TITLES[path]?.[clampedLevel] || 'Adventurer';
}

export function calculateStreak(
  transactions: Transaction[],
  todayStr?: string
): number {
  const today = todayStr || getTodayISO();
  const loggedDates = new Set(transactions.map((t) => t.date));

  // Determine starting point: either today or yesterday must have an entry
  const d = new Date(today + 'T00:00:00Z');
  const dIso = d.toISOString().slice(0, 10);

  const yesterday = new Date(d);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yIso = yesterday.toISOString().slice(0, 10);

  let currentCursor = new Date(d);
  if (!loggedDates.has(dIso)) {
    if (!loggedDates.has(yIso)) {
      return 0; // Streak broken
    }
    currentCursor = yesterday;
  }

  let streak = 0;
  while (true) {
    const iso = currentCursor.toISOString().slice(0, 10);
    if (loggedDates.has(iso)) {
      streak += 1;
      currentCursor.setUTCDate(currentCursor.getUTCDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function getCategorySpending(
  transactions: Transaction[],
  categoryId: string,
  monthStr: string
): number {
  let total = 0;
  for (const t of transactions) {
    if (t.type === 'expense' && t.categoryId === categoryId && t.date.startsWith(monthStr)) {
      total += t.amount;
    }
  }
  return total;
}

export function getCategoryBudgetStatuses(
  categories: Category[],
  transactions: Transaction[],
  monthStr: string
): CategoryBudgetStatus[] {
  const result: CategoryBudgetStatus[] = [];

  for (const cat of categories) {
    if (cat.monthlyLimit && cat.monthlyLimit > 0) {
      const spent = getCategorySpending(transactions, cat.id, monthStr);
      const pct = spent / cat.monthlyLimit;
      let status: 'normal' | 'warning' | 'danger' = 'normal';
      if (pct >= 1.0) status = 'danger';
      else if (pct >= 0.8) status = 'warning';

      result.push({
        category: cat,
        spent,
        limit: cat.monthlyLimit,
        pct: Number(pct.toFixed(2)),
        status,
      });
    }
  }

  return result;
}
