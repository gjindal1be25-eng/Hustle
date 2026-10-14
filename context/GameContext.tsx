'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from 'react';
import {
  GameState,
  Profile,
  Transaction,
  Category,
  Loan,
  Goal,
  Recurring,
  ThemeMode,
  CareerPath,
  CategoryBudgetStatus,
  LoanSummary,
  GameEvent,
  Lesson,
} from '@/lib/types';
import { loadGameState, saveGameState, clearGameState, INITIAL_STATE } from '@/lib/storage';
import {
  calculateBalance,
  calculateNetSavings,
  calculateAvgMonthlyIncome,
  calculateSavedMonths,
  calculateLevel,
  getLevelTitle,
  calculateLoanSummary,
  getCategoryBudgetStatuses,
  calculateStreak,
  calculateGoalProgress,
  getCurrentMonthISO,
  getTodayISO,
} from '@/lib/rules';
import { postDueLoanEMIs } from '@/lib/loan';
import { processRecurringTransactions } from '@/lib/recurring';
import { evaluateEvents, evaluatePerEntryReaction } from '@/lib/events';
import { getInsightTips, InsightTip } from '@/lib/insights';
import { checkLessonTriggers, getLessonById } from '@/lib/lessons';
import { checkBadgeUnlocks } from '@/lib/badges';
import { generateDemoState } from '@/lib/demoData';
import { playCoinSound, playFanfareSound, playWarningSound } from '@/lib/sound';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'alert' | 'info';
}

export interface ActiveReaction {
  mood: 'happy' | 'neutral' | 'side-eye' | 'worried' | 'sad' | 'celebrating';
  message: string;
}

type Action =
  | { type: 'LOAD_STATE'; payload: GameState }
  | { type: 'SET_PROFILE'; payload: Profile }
  | { type: 'UPDATE_PROFILE'; payload: Partial<Profile> }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY_LIMIT'; payload: { id: string; limit?: number } }
  | { type: 'RENAME_CATEGORY'; payload: { id: string; name: string } }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'TAKE_LOAN'; payload: Loan }
  | { type: 'CLOSE_LOAN' }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'MARK_GOAL_REACHED'; payload: { id: string; date: string } }
  | { type: 'ADD_RECURRING'; payload: Recurring }
  | { type: 'TOGGLE_RECURRING'; payload: string }
  | { type: 'DELETE_RECURRING'; payload: string }
  | { type: 'MARK_LESSON_SEEN'; payload: number }
  | { type: 'UPDATE_LAST_SEEN_LEVEL'; payload: number }
  | { type: 'SET_THEME'; payload: ThemeMode }
  | { type: 'LOAD_DEMO' }
  | { type: 'RESET_ALL' };

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'SET_PROFILE':
      return {
        ...state,
        profile: action.payload,
      };

    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: state.profile ? { ...state.profile, ...action.payload } : null,
      };

    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };

    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };

    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };

    case 'UPDATE_CATEGORY_LIMIT':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id
            ? { ...c, monthlyLimit: action.payload.limit }
            : c
        ),
      };

    case 'RENAME_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? { ...c, name: action.payload.name } : c
        ),
      };

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
      };

    case 'TAKE_LOAN':
      return {
        ...state,
        loan: action.payload,
      };

    case 'CLOSE_LOAN':
      return {
        ...state,
        loan: state.loan ? { ...state.loan, active: false } : null,
      };

    case 'ADD_GOAL':
      return {
        ...state,
        goals: [...state.goals, action.payload],
      };

    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter((g) => g.id !== action.payload),
      };

    case 'MARK_GOAL_REACHED':
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload.id
            ? { ...g, reachedDate: action.payload.date }
            : g
        ),
      };

    case 'ADD_RECURRING':
      return {
        ...state,
        recurring: [...state.recurring, action.payload],
      };

    case 'TOGGLE_RECURRING':
      return {
        ...state,
        recurring: state.recurring.map((r) =>
          r.id === action.payload ? { ...r, active: !r.active } : r
        ),
      };

    case 'DELETE_RECURRING':
      return {
        ...state,
        recurring: state.recurring.filter((r) => r.id !== action.payload),
      };

    case 'MARK_LESSON_SEEN':
      if (state.lessonsSeen.some((l) => l.lessonId === action.payload)) {
        return state;
      }
      return {
        ...state,
        lessonsSeen: [
          ...state.lessonsSeen,
          { lessonId: action.payload, firstShownDate: getTodayISO() },
        ],
      };

    case 'UPDATE_LAST_SEEN_LEVEL':
      return {
        ...state,
        meta: { ...state.meta, lastSeenLevel: action.payload },
      };

    case 'SET_THEME':
      return {
        ...state,
        profile: state.profile ? { ...state.profile, theme: action.payload } : null,
      };

    case 'LOAD_DEMO':
      return generateDemoState();

    case 'RESET_ALL':
      return INITIAL_STATE;

    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  isLoaded: boolean;
  balance: number;
  netSavings: number;
  avgMonthlyIncome: number;
  savedMonths: number;
  level: number;
  levelTitle: string;
  activeEvent: GameEvent;
  budgetStatuses: CategoryBudgetStatus[];
  insightTips: InsightTip[];
  streak: number;
  loanSummary: LoanSummary | null;
  activeReaction: ActiveReaction | null;
  toasts: ToastMessage[];
  pendingLesson: Lesson | null;

  // Actions
  setProfile: (profile: Profile) => void;
  updateProfile: (profile: Partial<Profile>) => void;
  logTransaction: (tx: Omit<Transaction, 'id' | 'source'>) => boolean;
  deleteTransaction: (id: string) => void;
  addCategory: (name: string, defaultTag: 'need' | 'want', monthlyLimit?: number) => void;
  updateCategoryLimit: (id: string, limit?: number) => void;
  renameCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => boolean;
  takeLoan: (principal: number, annualRatePct: number, months: number) => void;
  closeLoan: () => void;
  addGoal: (name: string, targetAmount: number) => void;
  deleteGoal: (id: string) => void;
  markGoalReached: (id: string) => void;
  addRecurring: (rec: Omit<Recurring, 'id' | 'active'>) => void;
  toggleRecurring: (id: string) => void;
  deleteRecurring: (id: string) => void;
  dismissLesson: (lessonId: number) => void;
  setTheme: (theme: ThemeMode) => void;
  setCareerPath: (path: CareerPath) => void;
  loadDemo: () => void;
  resetAll: () => void;
  addToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeReaction, setActiveReaction] = useState<ActiveReaction | null>(null);

  // Client-side initialization from localStorage
  useEffect(() => {
    const loaded = loadGameState();
    const today = getTodayISO();

    // Run loan and recurring idempotency sync
    const loanSync = postDueLoanEMIs(loaded.loan, loaded.transactions, today);
    let updatedTx = [...loaded.transactions, ...loanSync.newTransactions];

    const recSync = processRecurringTransactions(loaded.recurring, today);
    updatedTx = [...updatedTx, ...recSync.newTransactions];

    const syncedState: GameState = {
      ...loaded,
      loan: loanSync.updatedLoan,
      recurring: recSync.updatedRecurring,
      transactions: updatedTx,
    };

    dispatch({ type: 'LOAD_STATE', payload: syncedState });
    setIsLoaded(true);
  }, []);

  // Save to localStorage on state changes
  useEffect(() => {
    if (isLoaded) {
      saveGameState(state);
    }
  }, [state, isLoaded]);

  const addToast = (
    title: string,
    message: string,
    type: ToastMessage['type'] = 'info'
  ) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper derivations
  const today = getTodayISO();
  const currentMonth = getCurrentMonthISO(today);

  const balance = useMemo(
    () => calculateBalance(state.profile?.openingBalance || 0, state.transactions, today),
    [state.profile?.openingBalance, state.transactions, today]
  );

  const netSavings = useMemo(
    () => calculateNetSavings(state.transactions, today),
    [state.transactions, today]
  );

  const avgMonthlyIncome = useMemo(
    () => calculateAvgMonthlyIncome(state.transactions, today),
    [state.transactions, today]
  );

  const savedMonths = useMemo(
    () => calculateSavedMonths(netSavings, avgMonthlyIncome),
    [netSavings, avgMonthlyIncome]
  );

  const level = useMemo(() => calculateLevel(savedMonths), [savedMonths]);

  const levelTitle = useMemo(
    () => getLevelTitle(level, state.profile?.path || 'corporate'),
    [level, state.profile?.path]
  );

  const activeEvent = useMemo(
    () => evaluateEvents(state, today),
    [state, today]
  );

  const budgetStatuses = useMemo(
    () => getCategoryBudgetStatuses(state.categories, state.transactions, currentMonth),
    [state.categories, state.transactions, currentMonth]
  );

  const insightTips = useMemo(
    () => getInsightTips(state, today),
    [state, today]
  );

  const streak = useMemo(
    () => calculateStreak(state.transactions, today),
    [state.transactions, today]
  );

  const loanSummary = useMemo(() => {
    if (!state.loan || !state.loan.active) return null;
    return calculateLoanSummary(
      state.loan.principal,
      state.loan.annualRatePct,
      state.loan.months,
      avgMonthlyIncome
    );
  }, [state.loan, avgMonthlyIncome]);

  // Check for newly unlocked badges
  useEffect(() => {
    if (!isLoaded) return;
    const newBadges = checkBadgeUnlocks(state, today);
    if (newBadges.length > 0) {
      playFanfareSound();
      newBadges.forEach((b) => {
        addToast('Badge Unlocked! 🏆', `You earned the "${b.id.replace('_', ' ')}" badge!`, 'success');
      });
    }
  }, [state.transactions.length, state.goals, isLoaded, today]);

  // Check for reached goals and stamp reachedDate
  useEffect(() => {
    if (!isLoaded) return;
    state.goals.forEach((g) => {
      if (!g.reachedDate) {
        const { isReached } = calculateGoalProgress(g, state.transactions, today);
        if (isReached) {
          playFanfareSound();
          dispatch({ type: 'MARK_GOAL_REACHED', payload: { id: g.id, date: today } });
          addToast(
            'Goal Achieved! 🏆',
            `Congratulations! You achieved your savings goal: "${g.name}"!`,
            'success'
          );
        }
      }
    });
  }, [state.transactions.length, state.goals, isLoaded, today]);

  // Check for triggered lessons
  const pendingLesson = useMemo(() => {
    if (!isLoaded) return null;
    const triggered = checkLessonTriggers(state, today);
    if (triggered.length > 0) {
      return getLessonById(triggered[0]) || null;
    }
    return null;
  }, [state, isLoaded, today]);

  // Actions
  const setProfile = (profile: Profile) => {
    dispatch({ type: 'SET_PROFILE', payload: profile });
    addToast('Welcome to Town!', `Greetings, ${profile.name}! Your adventure begins.`, 'success');
  };

  const updateProfile = (profile: Partial<Profile>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: profile });
  };

  const logTransaction = (tx: Omit<Transaction, 'id' | 'source'>): boolean => {
    if (tx.amount <= 0 || isNaN(tx.amount)) {
      addToast('Invalid Amount', 'Please enter a positive amount above ₹0.', 'alert');
      return false;
    }
    if (tx.type === 'expense' && !tx.categoryId) {
      addToast('Category Required', 'Please select a category for this expense.', 'alert');
      return false;
    }

    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      source: 'manual',
    };

    dispatch({ type: 'ADD_TRANSACTION', payload: newTx });
    playCoinSound();

    // Reaction & Budget warnings
    const category = state.categories.find((c) => c.id === tx.categoryId);
    let budgetPct: number | undefined;
    if (category?.monthlyLimit) {
      const priorSpent = budgetStatuses.find((b) => b.category.id === category.id)?.spent || 0;
      budgetPct = (priorSpent + tx.amount) / category.monthlyLimit;
      if (budgetPct >= 1.0) {
        playWarningSound();
        addToast(
          'Budget Exceeded! ⚠️',
          `${category.name} is now over budget by ₹${Math.round((budgetPct - 1) * category.monthlyLimit).toLocaleString('en-IN')}.`,
          'alert'
        );
      } else if (budgetPct >= 0.8) {
        playWarningSound();
        addToast(
          'Budget Alert ⚡',
          `${category.name} is at ${(budgetPct * 100).toFixed(0)}% of limit.`,
          'warning'
        );
      }
    }

    const balRatio = avgMonthlyIncome > 0 ? (balance - (tx.type === 'expense' ? tx.amount : -tx.amount)) / avgMonthlyIncome : 1;
    const reaction = evaluatePerEntryReaction(
      tx.type,
      tx.tag,
      state.profile?.name || 'Hero',
      category?.name,
      budgetPct,
      balRatio
    );
    setActiveReaction(reaction);

    return true;
  };

  const deleteTransaction = (id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    addToast('Entry Removed', 'Transaction was successfully deleted.', 'info');
  };

  const addCategory = (name: string, defaultTag: 'need' | 'want', monthlyLimit?: number) => {
    const id = `cat_custom_${Date.now()}`;
    const newCat: Category = {
      id,
      name,
      defaultTag,
      isCustom: true,
      monthlyLimit,
    };
    dispatch({ type: 'ADD_CATEGORY', payload: newCat });
    addToast('New Category', `Created category "${name}".`, 'success');
  };

  const updateCategoryLimit = (id: string, limit?: number) => {
    dispatch({ type: 'UPDATE_CATEGORY_LIMIT', payload: { id, limit } });
    addToast('Budget Updated', 'Category monthly limit updated.', 'info');
  };

  const renameCategory = (id: string, name: string) => {
    if (!name.trim()) return;
    dispatch({ type: 'RENAME_CATEGORY', payload: { id, name: name.trim() } });
    addToast('Category Renamed', `Category updated to "${name.trim()}".`, 'info');
  };

  const deleteCategory = (id: string): boolean => {
    const hasTransactions = state.transactions.some((t) => t.categoryId === id);
    if (hasTransactions) {
      addToast(
        'Cannot Delete Category ⚠️',
        'This category has logged transactions. Spec rule: rename only.',
        'alert'
      );
      return false;
    }
    const cat = state.categories.find((c) => c.id === id);
    if (!cat?.isCustom) {
      addToast('System Category', 'Default system categories cannot be deleted.', 'alert');
      return false;
    }
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
    addToast('Category Deleted', `Removed category "${cat.name}".`, 'info');
    return true;
  };

  const takeLoan = (principal: number, annualRatePct: number, months: number) => {
    const loan: Loan = {
      principal,
      annualRatePct,
      months,
      startDate: getTodayISO(),
      active: true,
    };
    dispatch({ type: 'TAKE_LOAN', payload: loan });
    // Run immediate EMI check
    const sync = postDueLoanEMIs(loan, state.transactions, today);
    if (sync.newTransactions.length > 0) {
      sync.newTransactions.forEach((t) => {
        dispatch({ type: 'ADD_TRANSACTION', payload: t });
      });
    }
    addToast('Loan Active', `Borrowed ₹${principal.toLocaleString('en-IN')}. EMI schedule initiated.`, 'warning');
  };

  const closeLoan = () => {
    dispatch({ type: 'CLOSE_LOAN' });
    addToast('Loan Paid Off! 📜', 'Your debt is fully cleared. Freedom achieved!', 'success');
  };

  const addGoal = (name: string, targetAmount: number) => {
    const goal: Goal = {
      id: `goal_${Date.now()}`,
      name,
      targetAmount,
      createdDate: getTodayISO(),
    };
    dispatch({ type: 'ADD_GOAL', payload: goal });
    addToast('Goal Created 🎯', `Aiming for "${name}" (₹${targetAmount.toLocaleString('en-IN')}).`, 'success');
  };

  const deleteGoal = (id: string) => {
    dispatch({ type: 'DELETE_GOAL', payload: id });
    addToast('Goal Deleted', 'Savings goal was removed.', 'info');
  };

  const markGoalReached = (id: string) => {
    dispatch({ type: 'MARK_GOAL_REACHED', payload: { id, date: getTodayISO() } });
  };

  const addRecurring = (rec: Omit<Recurring, 'id' | 'active'>) => {
    const newRec: Recurring = {
      ...rec,
      id: `rec_${Date.now()}`,
      active: true,
    };
    dispatch({ type: 'ADD_RECURRING', payload: newRec });
    // Process immediately
    const sync = processRecurringTransactions([newRec], today);
    if (sync.newTransactions.length > 0) {
      sync.newTransactions.forEach((t) => {
        dispatch({ type: 'ADD_TRANSACTION', payload: t });
      });
    }
    addToast('Recurring Entry', `Automated ${rec.frequency} ${rec.type}.`, 'success');
  };

  const toggleRecurring = (id: string) => {
    dispatch({ type: 'TOGGLE_RECURRING', payload: id });
  };

  const deleteRecurring = (id: string) => {
    dispatch({ type: 'DELETE_RECURRING', payload: id });
    addToast('Automation Stopped', 'Recurring rule was removed.', 'info');
  };

  const dismissLesson = (lessonId: number) => {
    dispatch({ type: 'MARK_LESSON_SEEN', payload: lessonId });
  };

  const setTheme = (theme: ThemeMode) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const setCareerPath = (path: CareerPath) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: { path } });
    addToast('Career Shift', `Switched career to ${path}.`, 'info');
  };

  const loadDemo = () => {
    dispatch({ type: 'LOAD_DEMO' });
    addToast('Demo Loaded', 'Loaded Judge Demo Profile (Level 2 Clerk with ₹35k Salary).', 'success');
  };

  const resetAll = () => {
    clearGameState();
    dispatch({ type: 'RESET_ALL' });
    addToast('Data Reset', 'All data reset. Welcome back to Setup!', 'info');
  };

  return (
    <GameContext.Provider
      value={{
        state,
        isLoaded,
        balance,
        netSavings,
        avgMonthlyIncome,
        savedMonths,
        level,
        levelTitle,
        activeEvent,
        budgetStatuses,
        insightTips,
        streak,
        loanSummary,
        activeReaction,
        toasts,
        pendingLesson,
        setProfile,
        updateProfile,
        logTransaction,
        deleteTransaction,
        addCategory,
        updateCategoryLimit,
        renameCategory,
        deleteCategory,
        takeLoan,
        closeLoan,
        addGoal,
        deleteGoal,
        markGoalReached,
        addRecurring,
        toggleRecurring,
        deleteRecurring,
        dismissLesson,
        setTheme,
        setCareerPath,
        loadDemo,
        resetAll,
        addToast,
        removeToast,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
