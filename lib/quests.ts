import { GameState } from './types';
import { calculateSavedMonths, calculateNetSavings, calculateAvgMonthlyIncome, getTodayISO } from './rules';

export interface QuestStep {
  id: string;
  chapterId: number;
  stepNumber: number;
  title: string;
  description: string;
  targetBuildingId: 'work' | 'market' | 'vault' | 'bank' | 'school' | 'townhall' | 'home' | null;
  targetRoute: string;
  actionLabel: string;
  rewardRenown: number;
  financialRationale: string;
  isCompleted: (state: GameState) => boolean;
}

export interface QuestChapter {
  id: number;
  title: string;
  rankTitle: string;
  subtitle: string;
  description: string;
  rewardRenown: number;
  steps: QuestStep[];
}

export interface QuestProgress {
  currentChapter: QuestChapter;
  currentStep: QuestStep | null;
  completedStepIds: string[];
  chapterCompletedCount: number;
  totalChapters: number;
  isAllCompleted: boolean;
  activeBuildingId: string | null;
  activeRoute: string | null;
}

export interface DailyHabit {
  id: string;
  title: string;
  desc: string;
  icon: string;
  rewardRenown: number;
  targetRoute: string;
  actionLabel: string;
  isCompleted: (state: GameState, today: string) => boolean;
}

export interface DailyHabitsProgress {
  habits: {
    habit: DailyHabit;
    completed: boolean;
  }[];
  completedCount: number;
  totalCount: number;
  allCompleted: boolean;
}

export const QUEST_CHAPTERS: QuestChapter[] = [
  {
    id: 1,
    title: 'Chapter 1: Cash Flow Foundation',
    rankTitle: 'Level 1 · Broke Novice',
    subtitle: 'Get On The Board',
    description: 'Establish your baseline financial reality: record your income, categorize daily needs, and build a healthy daily town rhythm.',
    rewardRenown: 50,
    steps: [
      {
        id: 'c1_s1_income',
        chapterId: 1,
        stepNumber: 1,
        title: 'Log Take-Home Pay',
        description: 'Visit Workplace and record your monthly salary, freelance gig, or retainer.',
        targetBuildingId: 'work',
        targetRoute: '/work',
        actionLabel: 'Go to Work',
        rewardRenown: 25,
        financialRationale: 'You cannot budget what you do not measure. Establishing your net take-home pay is the first step in personal finance.',
        isCompleted: (state: GameState) =>
          state.transactions.some((t) => t.type === 'income') ||
          (state.completedQuests || []).includes('c1_s1_income'),
      },
      {
        id: 'c1_s2_expense',
        chapterId: 1,
        stepNumber: 2,
        title: 'Categorize Living Expense',
        description: 'Go to Market and record a fixed Need (groceries, rent, electricity, or transport).',
        targetBuildingId: 'market',
        targetRoute: '/market',
        actionLabel: 'Visit Market',
        rewardRenown: 25,
        financialRationale: 'Tracking needs separately from wants stops silent lifestyle leaks before they compound.',
        isCompleted: (state: GameState) =>
          state.transactions.some((t) => t.type === 'expense') ||
          (state.completedQuests || []).includes('c1_s2_expense'),
      },
      {
        id: 'c1_s3_sheru',
        chapterId: 1,
        stepNumber: 3,
        title: 'Daily Mindfulness with Sheru',
        description: 'Walk to the town square and pet Sheru to start your pet happiness bond.',
        targetBuildingId: null,
        targetRoute: '/',
        actionLabel: 'Pet Sheru',
        rewardRenown: 20,
        financialRationale: 'Financial discipline is a marathon of emotional consistency. Daily mindfulness keeps you grounded.',
        isCompleted: (state: GameState) =>
          (state.lastPettedDate !== undefined && state.lastPettedDate !== '') ||
          (state.completedQuests || []).includes('c1_s3_sheru'),
      },
    ],
  },
  {
    id: 2,
    title: 'Chapter 2: The Emergency Shield',
    rankTitle: 'Level 2 · 1-Month Buffer',
    subtitle: 'Build Your Financial Moat',
    description: 'Protect your peace of mind with a dedicated emergency cushion and master the 50/30/20 budget framework.',
    rewardRenown: 75,
    steps: [
      {
        id: 'c2_s1_vault_goal',
        chapterId: 2,
        stepNumber: 1,
        title: 'Lock In Emergency Goal',
        description: 'Visit the Vault and create a 1-Month Emergency Cushion target.',
        targetBuildingId: 'vault',
        targetRoute: '/vault',
        actionLabel: 'Open Vault',
        rewardRenown: 35,
        financialRationale: 'An emergency fund is not an investment; it is an insurance shield against medical inflation and unexpected debt.',
        isCompleted: (state: GameState) =>
          state.goals.length > 0 || (state.completedQuests || []).includes('c2_s1_vault_goal'),
      },
      {
        id: 'c2_s2_townhall',
        chapterId: 2,
        stepNumber: 2,
        title: 'Audit 50/30/20 Ratio',
        description: 'Visit Town Hall to inspect your Needs vs Wants split and category limits.',
        targetBuildingId: 'townhall',
        targetRoute: '/townhall',
        actionLabel: 'Check Town Hall',
        rewardRenown: 30,
        financialRationale: 'The 50/30/20 rule guarantees that fixed obligations never exceed 50% of take-home pay, leaving 20% for pure wealth creation.',
        isCompleted: (state: GameState) =>
          (state.visitedBuildings || []).includes('townhall') ||
          (state.completedQuests || []).includes('c2_s2_townhall'),
      },
      {
        id: 'c2_s3_blitz',
        chapterId: 2,
        stepNumber: 3,
        title: 'Needs vs Wants Reflexes',
        description: 'Play a 25-second round of Needs vs Wants Blitz at Market and score points.',
        targetBuildingId: 'market',
        targetRoute: '/market',
        actionLabel: 'Play Blitz',
        rewardRenown: 30,
        financialRationale: 'Classifying purchases in real-time builds instinctive resistance against impulse retail sales.',
        isCompleted: (state: GameState) =>
          (state.completedQuests || []).includes('c2_s3_blitz') ||
          (state.renown ?? 0) >= 60,
      },
    ],
  },
  {
    id: 3,
    title: 'Chapter 3: Debt Defense & Domestic Benchmarks',
    rankTitle: 'Level 3 · 3-Month Cushion',
    subtitle: 'Slay The Interest Monster',
    description: 'Learn real Indian lending principles, audit prospective loan EMIs against the 30% cap, and acquire villager wisdom.',
    rewardRenown: 100,
    steps: [
      {
        id: 'c3_s1_bank_cap',
        chapterId: 3,
        stepNumber: 1,
        title: 'Audit 30% EMI Safety Cap',
        description: 'Visit the Bank and test an EMI calculation with the 30% safety gauge.',
        targetBuildingId: 'bank',
        targetRoute: '/bank',
        actionLabel: 'Run Bank Simulator',
        rewardRenown: 40,
        financialRationale: 'In domestic lending, exceeding 30–35% of income on fixed loan repayments leads straight to debt distress.',
        isCompleted: (state: GameState) =>
          (state.visitedBuildings || []).includes('bank') ||
          (state.completedQuests || []).includes('c3_s1_bank_cap'),
      },
      {
        id: 'c3_s2_socratic',
        chapterId: 3,
        stepNumber: 2,
        title: 'Answer Uncle Sharma',
        description: 'Talk to Uncle Sharma in the plaza and solve his Socratic credit card challenge.',
        targetBuildingId: null,
        targetRoute: '/',
        actionLabel: 'Talk to Sharma',
        rewardRenown: 35,
        financialRationale: 'Credit card rewards (5%) mask the brutal reality of 42% annualized interest when carrying a revolving balance.',
        isCompleted: (state: GameState) =>
          (state.completedQuests || []).includes('quest_sharma') ||
          (state.completedQuests || []).includes('c3_s2_socratic'),
      },
      {
        id: 'c3_s3_school_benchmarks',
        chapterId: 3,
        stepNumber: 3,
        title: 'Master Indian Benchmarks',
        description: 'Visit School and review domestic benchmarks (Health inflation & Term Life vs ULIP).',
        targetBuildingId: 'school',
        targetRoute: '/school?tab=benchmarks',
        actionLabel: 'Read Benchmarks',
        rewardRenown: 35,
        financialRationale: 'Medical inflation in India runs at 14% p.a. Mixing insurance with investment in ULIPs destroys long-term compounding.',
        isCompleted: (state: GameState) =>
          (state.visitedBuildings || []).includes('school') ||
          (state.completedQuests || []).includes('c3_s3_school_benchmarks'),
      },
    ],
  },
  {
    id: 4,
    title: 'Chapter 4: The Compound Wealth Engine',
    rankTitle: 'Level 4 · 6-Month Buffer',
    subtitle: 'Put Your Money To Work',
    description: 'Transition from surviving to wealth building: harness the 12% Nifty 50 compound curve and automate savings.',
    rewardRenown: 125,
    steps: [
      {
        id: 'c4_s1_time_machine',
        chapterId: 4,
        stepNumber: 1,
        title: 'Test Opportunity Cost',
        description: 'Open the School Opportunity Cost Time Machine and compare Cash vs FD vs Nifty 50.',
        targetBuildingId: 'school',
        targetRoute: '/school?tab=timemachine',
        actionLabel: 'Launch Time Machine',
        rewardRenown: 45,
        financialRationale: 'The Rule of 72 proves that ₹100/day at 12% CAGR doubles wealth every 6 years, while cash loses half its value to 6% inflation.',
        isCompleted: (state: GameState) =>
          (state.completedQuests || []).includes('c4_s1_time_machine') ||
          (state.visitedBuildings || []).includes('school'),
      },
      {
        id: 'c4_s2_recurring',
        chapterId: 4,
        stepNumber: 2,
        title: 'Automate Fixed Cash Flow',
        description: 'Set up an automated recurring salary (Work) or recurring bill (Market).',
        targetBuildingId: 'market',
        targetRoute: '/market?tab=recurring',
        actionLabel: 'Set Recurring Rule',
        rewardRenown: 40,
        financialRationale: 'Automating your finances eliminates decision fatigue and ensures you Pay Yourself First on the 1st of every month.',
        isCompleted: (state: GameState) =>
          state.recurring.length > 0 || (state.completedQuests || []).includes('c4_s2_recurring'),
      },
      {
        id: 'c4_s3_monument',
        chapterId: 4,
        stepNumber: 3,
        title: 'Commission Civic Landmark',
        description: 'Visit Town Hall and build a civic town decoration using earned Renown.',
        targetBuildingId: 'townhall',
        targetRoute: '/townhall?tab=builder',
        actionLabel: 'Build Monument',
        rewardRenown: 50,
        financialRationale: 'Celebrating community milestones reinforces positive behavioral momentum over decades.',
        isCompleted: (state: GameState) =>
          (state.decorations || []).length > 0 || (state.completedQuests || []).includes('c4_s3_monument'),
      },
    ],
  },
  {
    id: 5,
    title: 'Chapter 5: Financial Independence',
    rankTitle: 'Level 5 · Wealth Champion',
    subtitle: 'True Freedom & Security',
    description: 'Achieve complete financial defense: 6+ months of living buffer, zero toxic liabilities, and civic mastery.',
    rewardRenown: 200,
    steps: [
      {
        id: 'c5_s1_runway',
        chapterId: 5,
        stepNumber: 1,
        title: '6-Month Emergency Runway',
        description: 'Accumulate at least 6 months of living expenses saved in your net worth.',
        targetBuildingId: 'vault',
        targetRoute: '/vault',
        actionLabel: 'Inspect Runway',
        rewardRenown: 75,
        financialRationale: 'A 6-month buffer gives you the freedom to negotiate raises, leave toxic employers, and weather any economic storm.',
        isCompleted: (state: GameState) => {
          const net = calculateNetSavings(state.transactions);
          const inc = calculateAvgMonthlyIncome(state.transactions);
          const savedMonths = calculateSavedMonths(net, inc);
          return savedMonths >= 6 || (state.completedQuests || []).includes('c5_s1_runway');
        },
      },
      {
        id: 'c5_s2_debt_defense',
        chapterId: 5,
        stepNumber: 2,
        title: 'Zero High-Interest Debt',
        description: 'Ensure active loans remain below 30% EMI-to-income or maintain complete debt freedom.',
        targetBuildingId: 'bank',
        targetRoute: '/bank',
        actionLabel: 'Verify Solvency',
        rewardRenown: 60,
        financialRationale: 'Freedom from compound debt is the fastest wealth multiplier in personal finance.',
        isCompleted: (state: GameState) =>
          !state.loan?.active || (state.completedQuests || []).includes('c5_s2_debt_defense'),
      },
      {
        id: 'c5_s3_clocktower',
        chapterId: 5,
        stepNumber: 3,
        title: 'Build The Town Clocktower',
        description: 'Commission the grand Clocktower at Town Hall with accumulated Renown.',
        targetBuildingId: 'townhall',
        targetRoute: '/townhall?tab=builder',
        actionLabel: 'Construct Clocktower',
        rewardRenown: 100,
        financialRationale: 'The ultimate civic testament to disciplined financial mastery and long-term vision.',
        isCompleted: (state: GameState) =>
          (state.decorations || []).includes('deco_clocktower') ||
          (state.completedQuests || []).includes('c5_s3_clocktower'),
      },
    ],
  },
];

export const DAILY_HABITS: DailyHabit[] = [
  {
    id: 'daily_pet_sheru',
    title: '🐕 Pet Sheru Daily',
    desc: 'Give Sheru his daily pet in the plaza for +10% happiness and companionship.',
    icon: '🐾',
    rewardRenown: 10,
    targetRoute: '/',
    actionLabel: 'Pet Sheru',
    isCompleted: (state: GameState, today: string) => state.lastPettedDate === today,
  },
  {
    id: 'daily_villager_dialogue',
    title: '🧠 Socratic Wisdom',
    desc: 'Talk with Uncle Sharma, Kaka, or Priya in the town square.',
    icon: '💬',
    rewardRenown: 25,
    targetRoute: '/',
    actionLabel: 'Talk in Plaza',
    isCompleted: (state: GameState) =>
      (state.completedQuests || []).some(
        (q) => q.startsWith('quest_') || q.startsWith('socratic_')
      ),
  },
  {
    id: 'daily_blitz_game',
    title: '⚡ Needs vs Wants Blitz',
    desc: 'Play a 25-second reflex round at the Market.',
    icon: '🛒',
    rewardRenown: 20,
    targetRoute: '/market?tab=blitz',
    actionLabel: 'Play Blitz',
    isCompleted: (state: GameState) =>
      (state.completedQuests || []).includes('daily_blitz') || (state.renown ?? 0) >= 20,
  },
  {
    id: 'daily_log_transaction',
    title: '📖 Daily Money Log',
    desc: 'Log at least 1 real or simulated expense or income entry today.',
    icon: '✍️',
    rewardRenown: 15,
    targetRoute: '/market',
    actionLabel: 'Log Entry',
    isCompleted: (state: GameState, today: string) =>
      state.transactions.some((t) => t.date === today),
  },
];

export function evaluateQuestProgress(state: GameState): QuestProgress {
  const completedStepIds: string[] = [];
  let chapterCompletedCount = 0;

  for (const chapter of QUEST_CHAPTERS) {
    let allChapterStepsDone = true;
    for (const step of chapter.steps) {
      if (step.isCompleted(state)) {
        completedStepIds.push(step.id);
      } else {
        allChapterStepsDone = false;
      }
    }
    if (allChapterStepsDone) {
      chapterCompletedCount += 1;
    }
  }

  // Find the first chapter that has at least one incomplete step
  for (const chapter of QUEST_CHAPTERS) {
    const incompleteStep = chapter.steps.find((s) => !s.isCompleted(state));
    if (incompleteStep) {
      return {
        currentChapter: chapter,
        currentStep: incompleteStep,
        completedStepIds,
        chapterCompletedCount,
        totalChapters: QUEST_CHAPTERS.length,
        isAllCompleted: false,
        activeBuildingId: incompleteStep.targetBuildingId,
        activeRoute: incompleteStep.targetRoute,
      };
    }
  }

  // If all chapters are completed:
  const lastChapter = QUEST_CHAPTERS[QUEST_CHAPTERS.length - 1];
  return {
    currentChapter: lastChapter,
    currentStep: null,
    completedStepIds,
    chapterCompletedCount: QUEST_CHAPTERS.length,
    totalChapters: QUEST_CHAPTERS.length,
    isAllCompleted: true,
    activeBuildingId: null,
    activeRoute: null,
  };
}

export function evaluateDailyHabits(
  state: GameState,
  todayStr?: string
): DailyHabitsProgress {
  const today = todayStr || getTodayISO();
  let completedCount = 0;

  const habits = DAILY_HABITS.map((habit) => {
    const completed = habit.isCompleted(state, today);
    if (completed) completedCount += 1;
    return { habit, completed };
  });

  return {
    habits,
    completedCount,
    totalCount: DAILY_HABITS.length,
    allCompleted: completedCount === DAILY_HABITS.length,
  };
}
