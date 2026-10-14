import { describe, it, expect } from 'vitest';
import {
  calculateBalance,
  calculateNetSavings,
  calculateAvgMonthlyIncome,
  calculateSavedMonths,
  calculateMonthlySavingsRate,
  calculateWantsShare,
  calculateEMI,
  calculateLoanSummary,
  calculateGoalProgress,
  calculateLevel,
  getLevelTitle,
  calculateStreak,
  getCategoryBudgetStatuses,
} from './rules';
import { postDueLoanEMIs } from './loan';
import { processRecurringTransactions } from './recurring';
import { evaluateEvents, evaluatePerEntryReaction } from './events';
import { generateDemoState } from './demoData';
import { Transaction, Goal, Loan, Recurring, Category } from './types';
import { LEVEL_THRESHOLDS } from './constants';
import { ROAD_NODES, findShortestPath } from './roadGraph';
import { getInsightTips } from './insights';

describe('Rules Engine - Pure Math & Formulas', () => {
  it('calculates balance accurately including opening balance', () => {
    const tx: Transaction[] = [
      { id: '1', type: 'income', amount: 50000, date: '2026-10-01', note: '', source: 'manual' },
      { id: '2', type: 'expense', amount: 15000, date: '2026-10-02', note: '', source: 'manual' },
      { id: '3', type: 'expense', amount: 5000, date: '2026-10-05', note: '', source: 'manual' },
      { id: '4', type: 'income', amount: 10000, date: '2026-10-20', note: '', source: 'manual' },
    ];
    // opening 5000 + 50000 - 15000 - 5000 = 35000 up to 2026-10-10
    const balanceMid = calculateBalance(5000, tx, '2026-10-10');
    expect(balanceMid).toBe(35000);

    // full balance
    const balanceAll = calculateBalance(5000, tx, '2026-10-31');
    expect(balanceAll).toBe(45000);
  });

  it('calculates net savings strictly excluding opening balance', () => {
    const tx: Transaction[] = [
      { id: '1', type: 'income', amount: 20000, date: '2026-10-01', note: '', source: 'manual' },
      { id: '2', type: 'expense', amount: 8000, date: '2026-10-02', note: '', source: 'manual' },
    ];
    expect(calculateNetSavings(tx, '2026-10-31')).toBe(12000);
  });

  it('calculates average monthly income over unique income months', () => {
    const tx: Transaction[] = [
      { id: '1', type: 'income', amount: 30000, date: '2026-08-01', note: '', source: 'manual' },
      { id: '2', type: 'income', amount: 10000, date: '2026-08-15', note: '', source: 'manual' },
      { id: '3', type: 'income', amount: 40000, date: '2026-09-01', note: '', source: 'manual' },
    ];
    // Total 80,000 over 2 unique months (2026-08, 2026-09) = 40,000/mo
    expect(calculateAvgMonthlyIncome(tx, '2026-09-30')).toBe(40000);
  });

  it('calculates saved months and correctly maps to RPG levels', () => {
    expect(calculateSavedMonths(15000, 30000)).toBe(0.5); // L1
    expect(calculateLevel(0.5)).toBe(1);

    expect(calculateSavedMonths(42000, 35000)).toBe(1.2); // L2
    expect(calculateLevel(1.2)).toBe(2);

    expect(calculateSavedMonths(120000, 30000)).toBe(4.0); // L3
    expect(calculateLevel(4.0)).toBe(3);

    expect(calculateSavedMonths(210000, 30000)).toBe(7.0); // L4
    expect(calculateLevel(7.0)).toBe(4);

    expect(calculateSavedMonths(390000, 30000)).toBe(13.0); // L5
    expect(calculateLevel(13.0)).toBe(5);

    // Negative savings
    expect(calculateSavedMonths(-5000, 30000)).toBe(-0.17);
    expect(calculateLevel(-0.17)).toBe(1);
  });

  it('returns appropriate titles for career paths', () => {
    expect(getLevelTitle(1, 'corporate')).toBe('Guard');
    expect(getLevelTitle(2, 'corporate')).toBe('Clerk');
    expect(getLevelTitle(5, 'corporate')).toBe('CEO');

    expect(getLevelTitle(1, 'business')).toBe('Street vendor');
    expect(getLevelTitle(3, 'business')).toBe('Shopkeeper');
    expect(getLevelTitle(5, 'business')).toBe('Tycoon');

    expect(getLevelTitle(1, 'freelancer')).toBe('Gig starter');
    expect(getLevelTitle(4, 'freelancer')).toBe('Agency owner');
    expect(getLevelTitle(5, 'freelancer')).toBe('Creative mogul');
  });

  it('calculates monthly savings rate and wants share accurately', () => {
    const tx: Transaction[] = [
      { id: '1', type: 'income', amount: 50000, date: '2026-10-01', note: '', source: 'manual' },
      { id: '2', type: 'expense', amount: 20000, tag: 'need', date: '2026-10-05', note: '', source: 'manual' },
      { id: '3', type: 'expense', amount: 10000, tag: 'want', date: '2026-10-15', note: '', source: 'manual' },
    ];
    // Income = 50k, Expense = 30k -> Savings = 20k -> Rate = 20k/50k = 0.40 (40%)
    const rate = calculateMonthlySavingsRate(tx, '2026-10');
    expect(rate).toBe(0.4);

    // Total expense = 30k, Wants = 10k -> Wants share = 10k/30k = 0.333 (33.3%)
    const wants = calculateWantsShare(tx, '2026-10');
    expect(wants).toBe(0.333);

    // Zero income edge case
    expect(calculateMonthlySavingsRate([], '2026-10')).toBe(0);
    // Zero expense edge case
    expect(calculateWantsShare([], '2026-10')).toBe(0);
  });

  it('calculates EMI, total interest, and total payable matching financial formula', () => {
    // ₹50,000 at 12% for 12 months
    // Standard EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
    // r = 12 / 12 / 100 = 0.01
    // EMI = 50000 * 0.01 * (1.01^12) / (1.01^12 - 1) = 4442.44 -> 4442
    const emi = calculateEMI(50000, 12, 12);
    expect(emi).toBe(4442);

    const summary = calculateLoanSummary(50000, 12, 12, 35000);
    expect(summary.emi).toBe(4442);
    expect(summary.totalPayable).toBe(4442 * 12); // 53304
    expect(summary.totalInterest).toBe(53304 - 50000); // 3304
    expect(summary.emiToIncome).toBeCloseTo(4442 / 35000, 2);

    // 0% interest case
    expect(calculateEMI(12000, 0, 12)).toBe(1000);
  });

  it('computes goal progress and detects reach date condition', () => {
    const goal: Goal = {
      id: 'g1',
      name: 'Emergency Fund',
      targetAmount: 50000,
      createdDate: '2026-09-01',
    };
    const tx: Transaction[] = [
      { id: '1', type: 'income', amount: 30000, date: '2026-08-15', note: 'before goal', source: 'manual' },
      { id: '2', type: 'income', amount: 40000, date: '2026-09-05', note: 'after goal', source: 'manual' },
      { id: '3', type: 'expense', amount: 10000, date: '2026-09-10', note: 'after goal', source: 'manual' },
    ];
    // Net savings since 2026-09-01 is 40,000 - 10,000 = 30,000 (60%)
    const res1 = calculateGoalProgress(goal, tx, '2026-09-20');
    expect(res1.progress).toBe(30000);
    expect(res1.pct).toBe(60);
    expect(res1.isReached).toBe(false);

    // Add another 25,000 income -> 55,000 total -> capped at 50,000, isReached = true
    tx.push({ id: '4', type: 'income', amount: 25000, date: '2026-09-25', note: '', source: 'manual' });
    const res2 = calculateGoalProgress(goal, tx, '2026-09-30');
    expect(res2.progress).toBe(50000);
    expect(res2.pct).toBe(100);
    expect(res2.isReached).toBe(true);
  });

  it('calculates login / transaction streak', () => {
    const tx: Transaction[] = [
      { id: '1', type: 'expense', amount: 50, date: '2026-10-10', note: '', source: 'manual' },
      { id: '2', type: 'expense', amount: 50, date: '2026-10-11', note: '', source: 'manual' },
      { id: '3', type: 'expense', amount: 50, date: '2026-10-12', note: '', source: 'manual' },
      { id: '4', type: 'expense', amount: 50, date: '2026-10-13', note: '', source: 'manual' },
      { id: '5', type: 'expense', amount: 50, date: '2026-10-14', note: '', source: 'manual' },
    ];
    // Today is 2026-10-14 -> 5 consecutive days
    expect(calculateStreak(tx, '2026-10-14')).toBe(5);

    // If today is 2026-10-15 and no entry today, yesterday was 2026-10-14, so streak is still 5
    expect(calculateStreak(tx, '2026-10-15')).toBe(5);

    // If today is 2026-10-16, streak is broken -> 0
    expect(calculateStreak(tx, '2026-10-16')).toBe(0);
  });

  it('evaluates category budget statuses (<80% normal, 80-99% warning, >=100% danger)', () => {
    const categories: Category[] = [
      { id: 'c1', name: 'Food', defaultTag: 'need', isCustom: false, monthlyLimit: 5000 },
      { id: 'c2', name: 'Transport', defaultTag: 'need', isCustom: false, monthlyLimit: 2000 },
      { id: 'c3', name: 'Shopping', defaultTag: 'want', isCustom: false, monthlyLimit: 3000 },
    ];
    const tx: Transaction[] = [
      { id: '1', type: 'expense', categoryId: 'c1', amount: 4500, date: '2026-10-05', note: '', source: 'manual' }, // 90% -> warning
      { id: '2', type: 'expense', categoryId: 'c2', amount: 1200, date: '2026-10-06', note: '', source: 'manual' }, // 60% -> normal
      { id: '3', type: 'expense', categoryId: 'c3', amount: 3200, date: '2026-10-07', note: '', source: 'manual' }, // 106% -> danger
    ];

    const statuses = getCategoryBudgetStatuses(categories, tx, '2026-10');
    expect(statuses).toHaveLength(3);

    const food = statuses.find((s) => s.category.id === 'c1');
    expect(food?.status).toBe('warning');
    expect(food?.pct).toBe(0.9);

    const transport = statuses.find((s) => s.category.id === 'c2');
    expect(transport?.status).toBe('normal');

    const shopping = statuses.find((s) => s.category.id === 'c3');
    expect(shopping?.status).toBe('danger');
  });
});

describe('Loan & Recurring Idempotency', () => {
  it('posts loan EMIs idempotently without duplicating months', () => {
    const loan: Loan = {
      principal: 30000,
      annualRatePct: 12,
      months: 6,
      startDate: '2026-08-01',
      active: true,
    };

    // First run on 2026-09-15: should post for Aug 1 and Sep 1 (2 EMIs)
    const run1 = postDueLoanEMIs(loan, [], '2026-09-15');
    expect(run1.newTransactions).toHaveLength(2);
    expect(run1.newTransactions[0].date).toBe('2026-08-01');
    expect(run1.newTransactions[1].date).toBe('2026-09-01');

    // Second run on same day: should post 0 new transactions (idempotent!)
    const run2 = postDueLoanEMIs(loan, run1.newTransactions, '2026-09-15');
    expect(run2.newTransactions).toHaveLength(0);

    // Third run in October 2026: should post only 1 new transaction (Oct 1)
    const run3 = postDueLoanEMIs(loan, run1.newTransactions, '2026-10-05');
    expect(run3.newTransactions).toHaveLength(1);
    expect(run3.newTransactions[0].date).toBe('2026-10-01');
  });

  it('posts recurring transactions idempotently', () => {
    const recurringList: Recurring[] = [
      {
        id: 'rec_rent',
        type: 'expense',
        categoryId: 'cat_rent',
        tag: 'need',
        amount: 8000,
        frequency: 'monthly',
        startDate: '2026-08-01',
        active: true,
      },
    ];

    const run1 = processRecurringTransactions(recurringList, '2026-09-15');
    // Aug 1, Sep 1 -> 2 transactions
    expect(run1.newTransactions).toHaveLength(2);
    expect(run1.updatedRecurring[0].lastPostedDate).toBe('2026-09-01');

    // Run again immediately -> 0 new transactions
    const run2 = processRecurringTransactions(run1.updatedRecurring, '2026-09-15');
    expect(run2.newTransactions).toHaveLength(0);
  });
});

describe('Event & Reaction Priority Engine', () => {
  it('triggers debt spiral when balance < 0', () => {
    const demo = generateDemoState('2026-10-14');
    // Force a huge expense making balance negative
    demo.transactions.push({
      id: 'huge_loss',
      type: 'expense',
      amount: 150000,
      date: '2026-10-10',
      note: 'Emergency loss',
      source: 'manual',
    });

    const event = evaluateEvents(demo, '2026-10-14');
    expect(event.type).toBe('debt_spiral');
    expect(event.priority).toBe(1);
    expect(event.scene).toBe('Bank');
    expect(event.recoveryPlan).toBeDefined();
  });

  it('triggers debt spiral when EMI load exceeds 40% of income', () => {
    const demo = generateDemoState('2026-10-14');
    // Take an enormous loan with EMI > 14,000 (40% of 35,000)
    demo.loan = {
      principal: 200000,
      annualRatePct: 24,
      months: 12,
      startDate: '2026-10-01',
      active: true,
    };

    const event = evaluateEvents(demo, '2026-10-14');
    expect(event.type).toBe('debt_spiral');
    expect(event.whyLine).toContain('safe threshold is 40%');
  });

  it('generates per-entry reactions correctly by priority', () => {
    const overBudget = evaluatePerEntryReaction('expense', 'need', 'Demo', 'Food', 1.05, 0.5);
    expect(overBudget.mood).toBe('worried');
    expect(overBudget.message).toContain('over budget');

    const warningBudget = evaluatePerEntryReaction('expense', 'need', 'Demo', 'Food', 0.85, 0.5);
    expect(warningBudget.mood).toBe('worried');
    expect(warningBudget.message).toContain('85%');

    const income = evaluatePerEntryReaction('income', undefined, 'Demo', undefined, 0, 0.5);
    expect(income.mood).toBe('happy');
    expect(income.message).toContain('victory dance');

    const want = evaluatePerEntryReaction('expense', 'want', 'Demo', 'Shopping', 0.5, 0.5);
    expect(want.mood).toBe('side-eye');
  });
});

describe('Demo Data Specification Verification', () => {
  it('generates valid demo data landing on Level 2 Clerk with Food at ~90%', () => {
    const demo = generateDemoState('2026-10-14');

    expect(demo.profile?.name).toBe('Demo');
    expect(demo.profile?.path).toBe('corporate');

    // Check income and savings
    const netSavings = calculateNetSavings(demo.transactions, '2026-10-14');
    const avgIncome = calculateAvgMonthlyIncome(demo.transactions, '2026-10-14');
    const savedMonths = calculateSavedMonths(netSavings, avgIncome);
    const level = calculateLevel(savedMonths);
    const title = getLevelTitle(level, demo.profile!.path);

    expect(avgIncome).toBe(35000);
    expect(savedMonths).toBeGreaterThanOrEqual(1.0);
    expect(savedMonths).toBeLessThan(3.0);
    expect(level).toBe(2);
    expect(title).toBe('Clerk');

    // Food budget should be in warning (amber near 90%)
    const statuses = getCategoryBudgetStatuses(
      demo.categories,
      demo.transactions,
      '2026-10'
    );
    const foodStatus = statuses.find((s) => s.category.id === 'cat_food');
    expect(foodStatus?.status).toBe('warning');
    expect(foodStatus?.pct).toBe(0.9);

    // Event should not be stranded or debt spiral
    const event = evaluateEvents(demo, '2026-10-14');
    expect(event.type).not.toBe('stranded');
    expect(event.type).not.toBe('debt_spiral');
  });

  it('correctly handles Level 1 progress calculation without NaN', () => {
    // Level 1 threshold has minSavedMonths = -Infinity, which should not cause NaN
    const level = 1;
    const savedMonths = 0.5;
    const minSaved = Math.max(0, LEVEL_THRESHOLDS[level - 1]?.minSavedMonths ?? 0);
    const targetSaved = LEVEL_THRESHOLDS[level]?.minSavedMonths ?? 1;
    const currentSaved = Math.max(0, savedMonths);
    const progressRatio = (currentSaved - minSaved) / Math.max(0.1, targetSaved - minSaved);
    const progressPct = Math.min(100, Math.max(5, Math.round(progressRatio * 100)));

    expect(isNaN(progressPct)).toBe(false);
    expect(progressPct).toBe(50);
  });
});

describe('Road Graph & Pathfinding (CR 4)', () => {
  it('connects every building door to the central plaza', () => {
    const doors = [
      'work_door',
      'townhall_door',
      'vault_door',
      'home_door',
      'bank_door',
      'market_door',
      'school_door',
    ];

    doors.forEach((door) => {
      expect(ROAD_NODES[door]).toBeDefined();
      const path = findShortestPath('p_center', door);
      expect(path.length).toBeGreaterThan(1);
      expect(path[0]).toBe('p_center');
      expect(path[path.length - 1]).toBe(door);

      // Verify that every step in path is an actual neighbor
      for (let i = 0; i < path.length - 1; i++) {
        const u = ROAD_NODES[path[i]];
        const v = path[i + 1];
        const neighbors = Object.values(u.neighbors);
        expect(neighbors).toContain(v);
      }
    });
  });

  it('handles invalid or identical nodes safely', () => {
    expect(findShortestPath('p_center', 'p_center')).toEqual(['p_center']);
    expect(findShortestPath('invalid_node', 'p_center')).toEqual([]);
    expect(findShortestPath('p_center', 'invalid_node')).toEqual([]);
  });
});

describe('Loan & Recurring Idempotency', () => {
  it('does not double-charge loan EMI on repeated execution on same day', () => {
    const loan: Loan = {
      principal: 60000,
      annualRatePct: 12,
      months: 12,
      startDate: '2026-08-01',
      active: true,
    };
    const tx: Transaction[] = [];

    // Run first time on 2026-08-15
    const res1 = postDueLoanEMIs(loan, tx, '2026-08-15');
    expect(res1.newTransactions.length).toBe(1);

    // Run again with the posted transaction included
    const updatedTx = [...tx, ...res1.newTransactions];
    const res2 = postDueLoanEMIs(res1.updatedLoan, updatedTx, '2026-08-15');
    expect(res2.newTransactions.length).toBe(0);
  });

  it('does not double-process recurring entries on repeated execution on same day', () => {
    const rec: Recurring[] = [
      {
        id: 'r1',
        type: 'income',
        amount: 25000,
        frequency: 'monthly',
        startDate: '2026-09-01',
        active: true,
      },
    ];

    const res1 = processRecurringTransactions(rec, '2026-09-15');
    expect(res1.newTransactions.length).toBe(1);

    // Run again with updated recurring lastPostedDate
    const res2 = processRecurringTransactions(res1.updatedRecurring, '2026-09-15');
    expect(res2.newTransactions.length).toBe(0);
  });
});

describe('Insight Tips Engine', () => {
  it('generates warning tip when category exceeds monthly limit', () => {
    const demo = generateDemoState('2026-10-14');
    // Add heavy expense on food to blow past limit
    demo.transactions.push({
      id: 'tx_over',
      type: 'expense',
      categoryId: 'cat_food',
      amount: 50000,
      date: '2026-10-10',
      note: 'Huge feast',
      source: 'manual',
    });

    const tips = getInsightTips(demo, '2026-10-14');
    const budgetTip = tips.find((t) => t.type === 'alert' && t.title === 'Budget Alert');
    expect(budgetTip).toBeDefined();
    expect(budgetTip?.message).toContain('Food');
  });
});

