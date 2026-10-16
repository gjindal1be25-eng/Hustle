import { describe, it, expect } from 'vitest';
import {
  QUEST_CHAPTERS,
  DAILY_HABITS,
  evaluateQuestProgress,
  evaluateDailyHabits,
} from './quests';
import { GameState } from './types';
import { DEFAULT_CATEGORIES } from './constants';

function createInitialState(): GameState {
  return {
    profile: {
      name: 'Rohan',
      avatar: { hairColor: '#2C1810', outfitColor: '#2B4C7E' },
      path: 'corporate',
      openingBalance: 10000,
      createdAt: '2026-10-15',
      onboardingDone: true,
      theme: 'system',
    },
    categories: DEFAULT_CATEGORIES,
    transactions: [],
    recurring: [],
    loan: null,
    goals: [],
    badges: [],
    lessonsSeen: [],
    meta: { lastSeenLevel: 1, version: 1 },
    renown: 0,
    decorations: [],
    petHappiness: 80,
    completedQuests: [],
  };
}

describe('Quest Engine & Story Chapters', () => {
  it('defines 5 chapters with 3 steps each (15 total steps)', () => {
    expect(QUEST_CHAPTERS).toHaveLength(5);
    QUEST_CHAPTERS.forEach((ch, idx) => {
      expect(ch.id).toBe(idx + 1);
      expect(ch.steps).toHaveLength(3);
      ch.steps.forEach((st) => {
        expect(st.title).toBeTruthy();
        expect(st.description).toBeTruthy();
        expect(st.financialRationale).toBeTruthy();
        expect(st.rewardRenown).toBeGreaterThan(0);
      });
    });
  });

  it('fresh player starts at Chapter 1 Step 1 (Log Take-Home Pay targeting Work)', () => {
    const state = createInitialState();
    const progress = evaluateQuestProgress(state);

    expect(progress.currentChapter.id).toBe(1);
    expect(progress.currentStep?.id).toBe('c1_s1_income');
    expect(progress.activeBuildingId).toBe('work');
    expect(progress.activeRoute).toBe('/work');
    expect(progress.isAllCompleted).toBe(false);
  });

  it('logging income advances Chapter 1 to Step 2 (Categorize Living Expense at Market)', () => {
    const state = createInitialState();
    state.transactions.push({
      id: 'tx_salary',
      type: 'income',
      amount: 45000,
      date: '2026-10-16',
      note: 'Monthly salary',
      source: 'manual',
    });

    const progress = evaluateQuestProgress(state);
    expect(progress.currentChapter.id).toBe(1);
    expect(progress.currentStep?.id).toBe('c1_s2_expense');
    expect(progress.activeBuildingId).toBe('market');
    expect(progress.activeRoute).toBe('/market');
  });

  it('logging expense advances to Step 3 (Mindfulness with Sheru)', () => {
    const state = createInitialState();
    state.transactions.push(
      {
        id: 'tx_salary',
        type: 'income',
        amount: 45000,
        date: '2026-10-16',
        note: 'Monthly salary',
        source: 'manual',
      },
      {
        id: 'tx_groceries',
        type: 'expense',
        categoryId: 'cat_food',
        tag: 'need',
        amount: 3200,
        date: '2026-10-16',
        note: 'Monthly groceries',
        source: 'manual',
      }
    );

    const progress = evaluateQuestProgress(state);
    expect(progress.currentChapter.id).toBe(1);
    expect(progress.currentStep?.id).toBe('c1_s3_sheru');
  });

  it('petting Sheru completes Chapter 1 and advances to Chapter 2 (The Emergency Shield targeting Vault)', () => {
    const state = createInitialState();
    state.transactions.push(
      {
        id: 'tx_salary',
        type: 'income',
        amount: 45000,
        date: '2026-10-16',
        note: 'Monthly salary',
        source: 'manual',
      },
      {
        id: 'tx_groceries',
        type: 'expense',
        categoryId: 'cat_food',
        tag: 'need',
        amount: 3200,
        date: '2026-10-16',
        note: 'Monthly groceries',
        source: 'manual',
      }
    );
    state.lastPettedDate = '2026-10-16';

    const progress = evaluateQuestProgress(state);
    expect(progress.currentChapter.id).toBe(2);
    expect(progress.currentStep?.id).toBe('c2_s1_vault_goal');
    expect(progress.activeBuildingId).toBe('vault');
    expect(progress.activeRoute).toBe('/vault');
    expect(progress.chapterCompletedCount).toBe(1);
  });

  it('auto-detects progress when user already has goals and visited buildings', () => {
    const state = createInitialState();
    state.transactions.push({
      id: 'tx_salary',
      type: 'income',
      amount: 45000,
      date: '2026-10-16',
      note: 'Salary',
      source: 'manual',
    });
    state.transactions.push({
      id: 'tx_rent',
      type: 'expense',
      categoryId: 'cat_rent',
      tag: 'need',
      amount: 12000,
      date: '2026-10-16',
      note: 'Rent',
      source: 'manual',
    });
    state.lastPettedDate = '2026-10-16';
    state.goals.push({
      id: 'g_emergency',
      name: 'Emergency Cushion',
      targetAmount: 50000,
      createdDate: '2026-10-16',
    });
    state.visitedBuildings = ['townhall'];
    state.completedQuests = ['c2_s3_blitz'];

    const progress = evaluateQuestProgress(state);
    // Chapter 1 is done, Chapter 2 is done (goal + townhall + blitz)
    expect(progress.currentChapter.id).toBe(3);
    expect(progress.currentStep?.id).toBe('c3_s1_bank_cap');
    expect(progress.activeBuildingId).toBe('bank');
    expect(progress.activeRoute).toBe('/bank');
  });

  it('marks all chapters complete when all steps are satisfied', () => {
    const state = createInitialState();
    // Complete all step IDs in completedQuests
    state.completedQuests = [
      'c1_s1_income',
      'c1_s2_expense',
      'c1_s3_sheru',
      'c2_s1_vault_goal',
      'c2_s2_townhall',
      'c2_s3_blitz',
      'c3_s1_bank_cap',
      'c3_s2_socratic',
      'c3_s3_school_benchmarks',
      'c4_s1_time_machine',
      'c4_s2_recurring',
      'c4_s3_monument',
      'c5_s1_runway',
      'c5_s2_debt_defense',
      'c5_s3_clocktower',
    ];

    const progress = evaluateQuestProgress(state);
    expect(progress.isAllCompleted).toBe(true);
    expect(progress.chapterCompletedCount).toBe(5);
    expect(progress.currentStep).toBeNull();
  });
});

describe('Daily Village Noticeboard Habits', () => {
  it('defines 4 daily habits with actionable labels', () => {
    expect(DAILY_HABITS).toHaveLength(4);
    DAILY_HABITS.forEach((h) => {
      expect(h.title).toBeTruthy();
      expect(h.rewardRenown).toBeGreaterThan(0);
      expect(h.actionLabel).toBeTruthy();
    });
  });

  it('accurately evaluates today completed status for Sheru and transactions', () => {
    const state = createInitialState();
    const today = '2026-10-16';

    let daily = evaluateDailyHabits(state, today);
    expect(daily.completedCount).toBe(0);
    expect(daily.allCompleted).toBe(false);

    // Pet Sheru today
    state.lastPettedDate = today;
    daily = evaluateDailyHabits(state, today);
    expect(daily.habits.find((h) => h.habit.id === 'daily_pet_sheru')?.completed).toBe(true);
    expect(daily.completedCount).toBe(1);

    // Log a transaction today
    state.transactions.push({
      id: 'tx_tea',
      type: 'expense',
      amount: 20,
      date: today,
      note: 'Chai',
      source: 'manual',
    });
    daily = evaluateDailyHabits(state, today);
    expect(daily.habits.find((h) => h.habit.id === 'daily_log_transaction')?.completed).toBe(true);
    expect(daily.completedCount).toBe(2);

    // Complete Socratic villager dialogue
    state.completedQuests = ['socratic_uncle_sharma'];
    daily = evaluateDailyHabits(state, today);
    expect(daily.habits.find((h) => h.habit.id === 'daily_villager_dialogue')?.completed).toBe(true);
    expect(daily.completedCount).toBe(3);

    // Complete Blitz reflex game
    state.completedQuests.push('daily_blitz');
    daily = evaluateDailyHabits(state, today);
    expect(daily.habits.find((h) => h.habit.id === 'daily_blitz_game')?.completed).toBe(true);
    expect(daily.completedCount).toBe(4);
    expect(daily.allCompleted).toBe(true);
  });

  it('verifies decoration IDs complete civic monument quests', () => {
    const state = createInitialState();
    const ch4 = QUEST_CHAPTERS.find((c) => c.id === 4)!;
    const monumentStep = ch4.steps.find((s) => s.id === 'c4_s3_monument')!;
    expect(monumentStep.isCompleted(state)).toBe(false);

    state.decorations = ['flowerbeds'];
    expect(monumentStep.isCompleted(state)).toBe(true);

    const ch5 = QUEST_CHAPTERS.find((c) => c.id === 5)!;
    const clockStep = ch5.steps.find((s) => s.id === 'c5_s3_clocktower')!;
    expect(clockStep.isCompleted(state)).toBe(false);

    state.decorations.push('clocktower');
    expect(clockStep.isCompleted(state)).toBe(true);
  });
});
