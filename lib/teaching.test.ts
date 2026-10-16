import { describe, it, expect } from 'vitest';
import {
  evaluateContextualNudge,
  calculateOpportunityCostEngine,
  calculateSipFv,
  formatInr,
  BEHAVIORAL_BIASES,
  INDIAN_BENCHMARKS,
  SOCRATIC_DIALOGUES,
} from './teaching';
import { Transaction } from './types';

describe('Teaching Engine & Contextual Nudges (Prompt 8)', () => {
  it('formats rupee values cleanly in Lakhs and Crores', () => {
    expect(formatInr(5000)).toBe('₹5,000');
    expect(formatInr(420000)).toBe('₹4.20 L');
    expect(formatInr(12500000)).toBe('₹1.25 Cr');
  });

  it('calculates Opportunity Cost Time Machine projections accurately', () => {
    const res = calculateOpportunityCostEngine(100, 10);
    expect(res.dailyAmount).toBe(100);
    expect(res.years).toBe(10);
    expect(res.totalInvested).toBe(365000); // 100 * 365 * 10
    expect(res.cashPurchasingPower).toBeLessThan(res.totalInvested); // inflation drag
    expect(res.fdValue).toBeGreaterThan(res.totalInvested); // FD beats cash
    expect(res.niftyValue).toBeGreaterThan(res.fdValue); // Equity beats FD
    expect(res.opportunityCostGap).toBeGreaterThan(0);
    expect(res.chartPoints.length).toBe(11); // Year 0 to 10
  });

  it('calculates SIP future value accurately', () => {
    // ₹1,000 monthly at 12% annual for 10 years
    const fv = calculateSipFv(1000, 0.12, 10);
    // Standard formula: FV should be ~₹2.32 Lakhs
    expect(fv).toBeGreaterThan(230000);
    expect(fv).toBeLessThan(240000);
  });

  it('triggers Uncle Sharma zero-balance nudge when balance hits <= 0', () => {
    const tx = {
      type: 'expense' as const,
      categoryId: 'cat_food',
      tag: 'need' as const,
      amount: 1500,
      date: '2026-10-16',
      note: 'Grocery bill',
    };

    const nudge = evaluateContextualNudge(tx, [], 1000); // balance 1000 - 1500 = -500 <= 0
    expect(nudge).not.toBeNull();
    expect(nudge?.character).toBe('uncle_sharma');
    expect(nudge?.title).toContain('Zero Cushion');
  });

  it('triggers Priya 48-Hour Wishlist challenge when logging Want >= ₹2,000', () => {
    const tx = {
      type: 'expense' as const,
      categoryId: 'cat_shopping',
      tag: 'want' as const,
      amount: 2500,
      date: '2026-10-16',
      note: 'Sneakers',
    };

    const nudge = evaluateContextualNudge(tx, [], 10000);
    expect(nudge).not.toBeNull();
    expect(nudge?.character).toBe('priya');
    expect(nudge?.title).toContain('48-Hour Wishlist');
  });

  it('triggers Kaka Chai Vendor takeout opportunity cost on 3rd want/food in a week', () => {
    const history: Transaction[] = [
      {
        id: 'tx_1',
        type: 'expense',
        categoryId: 'cat_food',
        tag: 'want',
        amount: 800,
        date: '2026-10-14',
        note: 'Burger delivery',
        source: 'manual',
      },
      {
        id: 'tx_2',
        type: 'expense',
        categoryId: 'cat_fun',
        tag: 'want',
        amount: 500,
        date: '2026-10-15',
        note: 'Cinema snacks',
        source: 'manual',
      },
    ];

    const newTx = {
      type: 'expense' as const,
      categoryId: 'cat_food',
      tag: 'want' as const,
      amount: 1200,
      date: '2026-10-16',
      note: 'Weekend dinner delivery',
    };

    const nudge = evaluateContextualNudge(newTx, history, 20000);
    expect(nudge).not.toBeNull();
    expect(nudge?.character).toBe('kaka');
    expect(nudge?.quote).toContain('Bhai');
    expect(nudge?.calculationBox?.label).toBe('10-Year Opportunity Cost');
  });

  it('validates all behavioral bias challenges and options', () => {
    expect(BEHAVIORAL_BIASES.length).toBe(4);
    BEHAVIORAL_BIASES.forEach((bias) => {
      expect(bias.options.length).toBe(2);
      const hasCorrect = bias.options.some((o) => o.isCorrect);
      expect(hasCorrect).toBe(true);
      expect(bias.actionableRule.length).toBeGreaterThan(10);
    });
  });

  it('validates Indian Financial Benchmarks data integrity', () => {
    expect(INDIAN_BENCHMARKS.length).toBe(4);
    const emiCap = INDIAN_BENCHMARKS.find((b) => b.id === 'bm_30_emi_cap');
    expect(emiCap).toBeDefined();
    expect(emiCap?.benchmarkRule).toContain('30–35%');
  });

  it('validates Socratic Villager dialogues for all 3 NPCs', () => {
    expect(SOCRATIC_DIALOGUES.uncle_sharma.length).toBeGreaterThan(0);
    expect(SOCRATIC_DIALOGUES.kaka.length).toBeGreaterThan(0);
    expect(SOCRATIC_DIALOGUES.priya.length).toBeGreaterThan(0);

    Object.values(SOCRATIC_DIALOGUES).flat().forEach((d) => {
      expect(d.question.length).toBeGreaterThan(10);
      expect(d.optionA.feedback.length).toBeGreaterThan(10);
      expect(d.optionB.feedback.length).toBeGreaterThan(10);
      expect(d.rewardRenown).toBeGreaterThan(0);
    });
  });
});
