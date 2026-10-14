import { GameState } from './types';
import { STORAGE_KEY, CURRENT_VERSION, DEFAULT_CATEGORIES } from './constants';

export const INITIAL_STATE: GameState = {
  profile: null,
  categories: DEFAULT_CATEGORIES,
  transactions: [],
  recurring: [],
  loan: null,
  goals: [],
  badges: [],
  lessonsSeen: [],
  meta: {
    lastSeenLevel: 1,
    version: CURRENT_VERSION,
  },
};

export function loadGameState(): GameState {
  if (typeof window === 'undefined') {
    return INITIAL_STATE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return INITIAL_STATE;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return INITIAL_STATE;
    }

    // Version migration or fallback if needed
    if (!parsed.meta || parsed.meta.version !== CURRENT_VERSION) {
      // Future migrations go here; currently version 1 is canonical
      parsed.meta = { ...parsed.meta, version: CURRENT_VERSION };
    }

    // Ensure array fallbacks so UI never crashes on missing keys
    return {
      profile: parsed.profile || null,
      categories: Array.isArray(parsed.categories) ? parsed.categories : DEFAULT_CATEGORIES,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      recurring: Array.isArray(parsed.recurring) ? parsed.recurring : [],
      loan: parsed.loan || null,
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      badges: Array.isArray(parsed.badges) ? parsed.badges : [],
      lessonsSeen: Array.isArray(parsed.lessonsSeen) ? parsed.lessonsSeen : [],
      meta: {
        lastSeenLevel: parsed.meta?.lastSeenLevel || 1,
        lastRecapMonth: parsed.meta?.lastRecapMonth,
        version: CURRENT_VERSION,
      },
    };
  } catch (err) {
    console.error('Failed to parse hustle_v1 storage, resetting to initial state:', err);
    return INITIAL_STATE;
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function clearGameState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear state from localStorage:', err);
  }
}
