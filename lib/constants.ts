import { Category, CareerPath, Lesson, BadgeDefinition } from './types';

export const STORAGE_KEY = 'hustle_v1';
export const CURRENT_VERSION = 1;

export const DISCLAIMER_TEXT =
  'Educational tool. Not financial advice. Your data stays in your browser.';

export const AVATAR_PRESETS = {
  hairColors: [
    { label: 'Espresso', value: '#2C1810' },
    { label: 'Chestnut', value: '#5C3826' },
    { label: 'Golden', value: '#D4A373' },
    { label: 'Auburn', value: '#A04322' },
    { label: 'Crimson', value: '#D63031' },
    { label: 'Silver', value: '#9AA0A8' },
  ],
  outfitColors: [
    { label: 'Navy', value: '#2B4C7E' },
    { label: 'Emerald', value: '#2A9D8F' },
    { label: 'Coral', value: '#E76F51' },
    { label: 'Mustard', value: '#E9C46A' },
    { label: 'Plum', value: '#6A4C93' },
    { label: 'Charcoal', value: '#3A3F47' },
  ],
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_food', name: 'Food', defaultTag: 'need', isCustom: false, monthlyLimit: 6000 },
  { id: 'cat_rent', name: 'Rent', defaultTag: 'need', isCustom: false, monthlyLimit: 10000 },
  { id: 'cat_transport', name: 'Transport', defaultTag: 'need', isCustom: false, monthlyLimit: 2000 },
  { id: 'cat_bills', name: 'Bills', defaultTag: 'need', isCustom: false, monthlyLimit: 2500 },
  { id: 'cat_health', name: 'Health', defaultTag: 'need', isCustom: false },
  { id: 'cat_shopping', name: 'Shopping', defaultTag: 'want', isCustom: false, monthlyLimit: 3000 },
  { id: 'cat_fun', name: 'Fun', defaultTag: 'want', isCustom: false, monthlyLimit: 2500 },
  { id: 'cat_other', name: 'Other', defaultTag: 'want', isCustom: false },
  { id: 'cat_loan_emi', name: 'Loan EMI', defaultTag: 'need', isCustom: false },
  { id: 'cat_salary', name: 'Salary', defaultTag: 'need', isCustom: false },
];

export const LEVEL_THRESHOLDS = [
  { level: 1, minSavedMonths: -Infinity, maxSavedMonths: 1, name: 'Just starting' },
  { level: 2, minSavedMonths: 1, maxSavedMonths: 3, name: 'One month of income saved' },
  { level: 3, minSavedMonths: 3, maxSavedMonths: 6, name: 'Solid buffer' },
  { level: 4, minSavedMonths: 6, maxSavedMonths: 12, name: 'Strong cushion' },
  { level: 5, minSavedMonths: 12, maxSavedMonths: Infinity, name: 'Top of the ladder' },
];

export const CAREER_TITLES: Record<CareerPath, Record<number, string>> = {
  corporate: {
    1: 'Guard',
    2: 'Clerk',
    3: 'Analyst',
    4: 'Manager',
    5: 'CEO',
  },
  business: {
    1: 'Street vendor',
    2: 'Stall owner',
    3: 'Shopkeeper',
    4: 'Business owner',
    5: 'Tycoon',
  },
  freelancer: {
    1: 'Gig starter',
    2: 'Freelancer',
    3: 'Specialist',
    4: 'Agency owner',
    5: 'Creative mogul',
  },
};

export const LESSONS: Lesson[] = [
  {
    id: 1,
    title: 'Pay Yourself First',
    book: 'The Richest Man in Babylon',
    cardText:
      'Before the rent and before the samosas, move a slice of every income into savings. Treat it like a bill you owe your future self.',
    triggerHint: 'Log your first income or reach a 10%+ monthly savings rate.',
  },
  {
    id: 2,
    title: 'Assets vs Liabilities',
    book: 'Rich Dad Poor Dad',
    cardText:
      'An asset puts money in your pocket; a liability takes it out. A loan EMI is a liability, so check what it buys before you sign.',
    triggerHint: 'Take out an active loan in the Bank.',
  },
  {
    id: 3,
    title: 'Wants Add Up',
    book: 'Rich Dad Poor Dad',
    cardText:
      'Small wants feel tiny one by one, but they stack like pancakes. Pay needs and savings first, then enjoy the wants.',
    triggerHint: 'Spend more than 30% of a month on wants.',
  },
  {
    id: 4,
    title: 'Know Your Enough',
    book: 'The Psychology of Money',
    cardText:
      'Chasing more without knowing what is enough is a treadmill with no stop button. Decide what a good month looks like and aim there.',
    triggerHint: 'Earn your first career promotion (Level 2+).',
  },
  {
    id: 5,
    title: 'Margin of Safety',
    book: 'The Psychology of Money',
    cardText:
      'Life loves surprises, and not the cake kind. A buffer of about a month of expenses turns emergencies into inconveniences.',
    triggerHint: 'Recover from zero balance or dip below 1 month of expenses.',
  },
  {
    id: 6,
    title: 'Tiny Habits',
    book: 'Atomic Habits',
    cardText:
      'Big change grows from tiny actions repeated often, like logging one expense a day. Make it easy and the streak builds itself.',
    triggerHint: 'Create your first goal or reach a 7-day logging streak.',
  },
  {
    id: 7,
    title: 'Systems Beat Goals',
    book: 'Atomic Habits',
    cardText:
      'A goal says what you want; a system says what you do every week. Automate saving and recurring bills so willpower can nap.',
    triggerHint: 'Create a recurring entry or reach your first goal.',
  },
  {
    id: 8,
    title: 'Interest Cuts Both Ways',
    book: 'The Psychology of Money',
    cardText:
      'Compounding can grow your savings or your debt. On a loan, the longer it runs, the more interest you pay.',
    triggerHint: 'Trigger or observe a high loan load or debt spiral.',
  },
];

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: 'first_step', name: 'First Step', description: 'Logged your very first transaction', icon: '🌱' },
  { id: 'first_1k', name: 'First ₹1,000', description: 'Reached ₹1,000 in net savings', icon: '🪙' },
  { id: 'week_streak', name: 'Week Streak', description: 'Logged transactions 7 days in a row', icon: '🔥' },
  { id: 'habit_builder', name: 'Habit Builder', description: 'Maintained a 30-day logging streak', icon: '⭐' },
  { id: 'budget_keeper', name: 'Budget Keeper', description: 'Completed a month with no category over limit', icon: '🛡️' },
  { id: 'need_want_master', name: 'Need-Want Master', description: 'Kept wants at or below 30% for a full month', icon: '⚖️' },
  { id: 'goal_getter', name: 'Goal Getter', description: 'Successfully reached your first savings goal', icon: '🎯' },
  { id: 'loan_cleared', name: 'Loan Cleared', description: 'Paid off a loan cleanly without spiral', icon: '📜' },
  { id: 'rising_star', name: 'Rising Star', description: 'Promoted to Level 3 (Solid Buffer)', icon: '🚀' },
  { id: 'summit', name: 'Summit', description: 'Ascended to Level 5 (Top of the ladder)', icon: '👑' },
  { id: 'comeback_kid', name: 'Comeback Kid', description: 'Successfully climbed out of stranded or debt spiral', icon: '🧗' },
];
