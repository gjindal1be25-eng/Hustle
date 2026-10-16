export type CareerPath = 'corporate' | 'business' | 'freelancer';
export type NeedWantTag = 'need' | 'want';
export type TransactionType = 'income' | 'expense';
export type TransactionSource = 'manual' | 'recurring' | 'loan';
export type Frequency = 'daily' | 'weekly' | 'monthly';
export type ThemeMode = 'system' | 'day' | 'night';

export interface AvatarConfig {
  hairColor: string;
  outfitColor: string;
}

export interface Profile {
  name: string;
  avatar: AvatarConfig;
  path: CareerPath;
  openingBalance: number;
  createdAt: string; // ISO yyyy-mm-dd
  onboardingDone: boolean;
  theme: ThemeMode;
}

export interface Category {
  id: string;
  name: string;
  defaultTag: NeedWantTag;
  isCustom: boolean;
  monthlyLimit?: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  categoryId?: string;
  tag?: NeedWantTag; // for expenses
  amount: number; // > 0
  date: string; // ISO yyyy-mm-dd
  note: string;
  source: TransactionSource;
}

export interface Recurring {
  id: string;
  type: TransactionType;
  categoryId?: string;
  tag?: NeedWantTag;
  amount: number;
  frequency: Frequency;
  startDate: string; // ISO yyyy-mm-dd
  endDate?: string;
  active: boolean;
  lastPostedDate?: string;
}

export interface Loan {
  principal: number;
  annualRatePct: number;
  months: number;
  startDate: string; // ISO yyyy-mm-dd
  active: boolean;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  createdDate: string; // ISO yyyy-mm-dd
  reachedDate?: string; // ISO yyyy-mm-dd
}

export interface Badge {
  id: string;
  unlockedDate: string;
}

export interface LessonSeen {
  lessonId: number;
  firstShownDate: string;
}

export interface Meta {
  lastSeenLevel: number;
  lastRecapMonth?: string;
  version: number;
}

export interface GameState {
  profile: Profile | null;
  categories: Category[];
  transactions: Transaction[];
  recurring: Recurring[];
  loan: Loan | null;
  goals: Goal[];
  badges: Badge[];
  lessonsSeen: LessonSeen[];
  meta: Meta;
  renown?: number;
  decorations?: string[];
  petHappiness?: number;
  lastPettedDate?: string;
  completedQuests?: string[];
  resolvedDilemmas?: string[];
  visitedBuildings?: string[];
  viewMode?: 'quest' | 'finance';
}

export interface LoanSummary {
  emi: number;
  totalInterest: number;
  totalPayable: number;
  emiToIncome: number;
}

export type BudgetStatus = 'normal' | 'warning' | 'danger';

export interface CategoryBudgetStatus {
  category: Category;
  spent: number;
  limit: number;
  pct: number;
  status: BudgetStatus;
}

export type EventType =
  | 'debt_spiral'
  | 'stranded'
  | 'goal_reached'
  | 'promotion'
  | 'loan_taken'
  | 'default';

export interface GameEvent {
  priority: number;
  type: EventType;
  scene: 'Bank' | 'Bus stop' | 'Celebration' | 'Workplace' | 'Home';
  eventLine: string;
  whyLine: string;
  displayedLevel: number;
  effect?: string;
  recoveryPlan?: string[];
}

export interface Reaction {
  mood: 'happy' | 'neutral' | 'side-eye' | 'worried' | 'sad' | 'celebrating';
  message: string;
}

export interface Lesson {
  id: number;
  title: string;
  book: string;
  cardText: string;
  triggerHint: string;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
}
