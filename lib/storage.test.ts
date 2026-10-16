import { describe, it, expect, beforeEach } from 'vitest';
import { loadGameState, saveGameState, clearGameState, INITIAL_STATE } from './storage';
import { GameState } from './types';
import { DEFAULT_CATEGORIES, STORAGE_KEY } from './constants';

const store: Record<string, string> = {};

const mockLocalStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    Object.keys(store).forEach((k) => delete store[k]);
  },
};

// @ts-expect-error Mocking browser global window in node env
global.window = global;
// @ts-expect-error Mocking browser localStorage in node env
global.localStorage = mockLocalStorage;

describe('Storage Layer & GameState Hydration', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('returns INITIAL_STATE when storage is empty', () => {
    const state = loadGameState();
    expect(state.profile).toBeNull();
    expect(state.categories).toEqual(DEFAULT_CATEGORIES);
    expect(state.renown).toBe(0);
    expect(state.decorations).toEqual([]);
    expect(state.completedQuests).toEqual([]);
    expect(state.viewMode).toBe('quest');
  });

  it('preserves and restores all RPG and quest fields on loadGameState', () => {
    const fullState: GameState = {
      profile: {
        name: 'Aarav',
        avatar: { hairColor: '#2C1810', outfitColor: '#2B4C7E' },
        path: 'freelancer',
        openingBalance: 25000,
        createdAt: '2026-10-15',
        onboardingDone: true,
        theme: 'night',
      },
      categories: DEFAULT_CATEGORIES,
      transactions: [
        {
          id: 'tx_1',
          type: 'income',
          amount: 60000,
          date: '2026-10-16',
          note: 'Salary',
          source: 'manual',
        },
      ],
      recurring: [],
      loan: null,
      goals: [],
      badges: [{ id: 'first_step', unlockedDate: '2026-10-16' }],
      lessonsSeen: [{ lessonId: 1, firstShownDate: '2026-10-16' }],
      meta: { lastSeenLevel: 3, version: 1 },
      renown: 450,
      decorations: ['fountain', 'clocktower'],
      petHappiness: 95,
      lastPettedDate: '2026-10-16',
      completedQuests: ['c1_s1_income', 'socratic_uncle_sharma'],
      resolvedDilemmas: ['dilemma_bike'],
      visitedBuildings: ['work', 'market', 'bank', 'school'],
      viewMode: 'finance',
    };

    saveGameState(fullState);

    const loaded = loadGameState();
    expect(loaded.profile?.name).toBe('Aarav');
    expect(loaded.renown).toBe(450);
    expect(loaded.decorations).toEqual(['fountain', 'clocktower']);
    expect(loaded.petHappiness).toBe(95);
    expect(loaded.lastPettedDate).toBe('2026-10-16');
    expect(loaded.completedQuests).toEqual(['c1_s1_income', 'socratic_uncle_sharma']);
    expect(loaded.resolvedDilemmas).toEqual(['dilemma_bike']);
    expect(loaded.visitedBuildings).toEqual(['work', 'market', 'bank', 'school']);
    expect(loaded.viewMode).toBe('finance');
  });

  it('clearGameState removes state from storage', () => {
    saveGameState({
      ...INITIAL_STATE,
      renown: 100,
    });
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();

    clearGameState();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
