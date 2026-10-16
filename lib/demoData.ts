import { GameState, Transaction, Goal, Loan, Category } from './types';
import { DEFAULT_CATEGORIES, AVATAR_PRESETS } from './constants';
import { getTodayISO } from './rules';

export function generateDemoState(todayStr?: string): GameState {
  const today = todayStr || getTodayISO();
  const d = new Date(today + 'T00:00:00Z');

  // Calculate 3 months: m0 (2 months ago), m1 (1 month ago), m2 (current month)
  const getMonthPrefix = (offsetMonths: number): string => {
    const target = new Date(d);
    target.setUTCMonth(target.getUTCMonth() + offsetMonths);
    const y = target.getUTCFullYear();
    const m = String(target.getUTCMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };

  const m0 = getMonthPrefix(-2);
  const m1 = getMonthPrefix(-1);
  const m2 = getMonthPrefix(0);

  const categories: Category[] = DEFAULT_CATEGORIES.map((c) => {
    if (c.id === 'cat_rent') return { ...c, monthlyLimit: 6000 };
    if (c.id === 'cat_food') return { ...c, monthlyLimit: 5500 };
    if (c.id === 'cat_transport') return { ...c, monthlyLimit: 1500 };
    if (c.id === 'cat_bills') return { ...c, monthlyLimit: 1200 };
    if (c.id === 'cat_shopping') return { ...c, monthlyLimit: 2000 };
    if (c.id === 'cat_fun') return { ...c, monthlyLimit: 2000 };
    return c;
  });

  const transactions: Transaction[] = [];

  // Month 0 (2 months ago)
  transactions.push(
    { id: 'demo_inc_0', type: 'income', categoryId: 'cat_salary', amount: 35000, date: `${m0}-01`, note: 'Monthly Salary', source: 'manual' },
    { id: 'demo_rent_0', type: 'expense', categoryId: 'cat_rent', tag: 'need', amount: 6000, date: `${m0}-02`, note: 'Apartment rent', source: 'manual' },
    { id: 'demo_food_0_1', type: 'expense', categoryId: 'cat_food', tag: 'need', amount: 1200, date: `${m0}-04`, note: 'Weekly grocery', source: 'manual' },
    { id: 'demo_food_0_2', type: 'expense', categoryId: 'cat_food', tag: 'need', amount: 1400, date: `${m0}-11`, note: 'Veggies & milk', source: 'manual' },
    { id: 'demo_food_0_3', type: 'expense', categoryId: 'cat_food', tag: 'need', amount: 1100, date: `${m0}-18`, note: 'Pantry restock', source: 'manual' },
    { id: 'demo_food_0_4', type: 'expense', categoryId: 'cat_food', tag: 'need', amount: 1300, date: `${m0}-25`, note: 'Dinner ingredients', source: 'manual' },
    { id: 'demo_trans_0', type: 'expense', categoryId: 'cat_transport', tag: 'need', amount: 1200, date: `${m0}-08`, note: 'Metro card recharge', source: 'manual' },
    { id: 'demo_bills_0', type: 'expense', categoryId: 'cat_bills', tag: 'need', amount: 1000, date: `${m0}-10`, note: 'WiFi & electricity', source: 'manual' },
    { id: 'demo_shop_0', type: 'expense', categoryId: 'cat_shopping', tag: 'want', amount: 1500, date: `${m0}-15`, note: 'Desk organizer', source: 'manual' },
    { id: 'demo_fun_0', type: 'expense', categoryId: 'cat_fun', tag: 'want', amount: 1500, date: `${m0}-20`, note: 'Weekend outing', source: 'manual' },
    { id: 'demo_emi_0', type: 'expense', categoryId: 'cat_loan_emi', tag: 'need', amount: 4442, date: `${m0}-01`, note: 'Loan EMI (1/12)', source: 'loan' }
  );

  // Month 1 (1 month ago)
  transactions.push(
    { id: 'demo_inc_1', type: 'income', categoryId: 'cat_salary', amount: 35000, date: `${m1}-01`, note: 'Monthly Salary', source: 'manual' },
    { id: 'demo_rent_1', type: 'expense', categoryId: 'cat_rent', tag: 'need', amount: 6000, date: `${m1}-02`, note: 'Apartment rent', source: 'manual' },
    { id: 'demo_food_1_1', type: 'expense', categoryId: 'cat_food', tag: 'need', amount: 1300, date: `${m1}-03`, note: 'Grocery haul', source: 'manual' },
    { id: 'demo_food_1_2', type: 'expense', categoryId: 'cat_food', tag: 'need', amount: 1250, date: `${m1}-10`, note: 'Fruits & breakfast', source: 'manual' },
    { id: 'demo_food_1_3', type: 'expense', categoryId: 'cat_food', tag: 'need', amount: 1150, date: `${m1}-17`, note: 'Cooking supplies', source: 'manual' },
    { id: 'demo_food_1_4', type: 'expense', categoryId: 'cat_food', tag: 'need', amount: 1300, date: `${m1}-24`, note: 'Fresh produce', source: 'manual' },
    { id: 'demo_trans_1', type: 'expense', categoryId: 'cat_transport', tag: 'need', amount: 1200, date: `${m1}-07`, note: 'Metro pass', source: 'manual' },
    { id: 'demo_bills_1', type: 'expense', categoryId: 'cat_bills', tag: 'need', amount: 1000, date: `${m1}-10`, note: 'Internet bill', source: 'manual' },
    { id: 'demo_shop_1', type: 'expense', categoryId: 'cat_shopping', tag: 'want', amount: 1500, date: `${m1}-14`, note: 'Comfort sneakers', source: 'manual' },
    { id: 'demo_fun_1', type: 'expense', categoryId: 'cat_fun', tag: 'want', amount: 1500, date: `${m1}-22`, note: 'Board games cafe', source: 'manual' },
    { id: 'demo_emi_1', type: 'expense', categoryId: 'cat_loan_emi', tag: 'need', amount: 4442, date: `${m1}-01`, note: 'Loan EMI (2/12)', source: 'loan' }
  );

  // Month 2 (current month up to today)
  // Food spending total = 1400 + 1300 + 1200 + 1050 = 4950 / 5500 = 90% (amber warning state!)
  transactions.push(
    { id: 'demo_inc_2', type: 'income', categoryId: 'cat_salary', amount: 35000, date: `${m2}-01`, note: 'Monthly Salary', source: 'manual' },
    { id: 'demo_rent_2', type: 'expense', categoryId: 'cat_rent', tag: 'need', amount: 6000, date: `${m2}-02`, note: 'Apartment rent', source: 'manual' },
    { id: 'demo_food_2_1', type: 'expense', categoryId: 'cat_food', tag: 'need', amount: 1400, date: `${m2}-03`, note: 'Supermarket visit', source: 'manual' },
    { id: 'demo_food_2_2', type: 'expense', categoryId: 'cat_food', tag: 'need', amount: 1300, date: `${m2}-06`, note: 'Wholesale grains & dairy', source: 'manual' },
    { id: 'demo_food_2_3', type: 'expense', categoryId: 'cat_food', tag: 'need', amount: 1200, date: `${m2}-09`, note: 'Organic vegetables', source: 'manual' },
    { id: 'demo_food_2_4', type: 'expense', categoryId: 'cat_food', tag: 'need', amount: 1050, date: `${m2}-12`, note: 'Bakery & dry fruits', source: 'manual' },
    { id: 'demo_trans_2', type: 'expense', categoryId: 'cat_transport', tag: 'need', amount: 900, date: `${m2}-04`, note: 'Auto rickshaw passes', source: 'manual' },
    { id: 'demo_bills_2', type: 'expense', categoryId: 'cat_bills', tag: 'need', amount: 1000, date: `${m2}-08`, note: 'Phone & utility', source: 'manual' },
    { id: 'demo_shop_2', type: 'expense', categoryId: 'cat_shopping', tag: 'want', amount: 800, date: `${m2}-07`, note: 'New headphones', source: 'manual' },
    { id: 'demo_fun_2', type: 'expense', categoryId: 'cat_fun', tag: 'want', amount: 950, date: `${m2}-10`, note: 'Movies with friends', source: 'manual' },
    { id: 'demo_emi_2', type: 'expense', categoryId: 'cat_loan_emi', tag: 'need', amount: 4442, date: `${m2}-01`, note: 'Loan EMI (3/12)', source: 'loan' }
  );

  const loan: Loan = {
    principal: 50000,
    annualRatePct: 12,
    months: 12,
    startDate: `${m0}-01`,
    active: true,
  };

  const goals: Goal[] = [
    {
      id: 'demo_goal_laptop',
      name: 'Workstation Laptop',
      targetAmount: 70000,
      createdDate: `${m0}-01`,
    },
  ];

  return {
    profile: {
      name: 'Demo',
      avatar: {
        hairColor: AVATAR_PRESETS.hairColors[0].value,
        outfitColor: AVATAR_PRESETS.outfitColors[0].value,
      },
      path: 'corporate',
      openingBalance: 5000,
      createdAt: `${m0}-01`,
      onboardingDone: true,
      theme: 'system',
    },
    categories,
    transactions,
    recurring: [],
    loan,
    goals,
    badges: [{ id: 'first_step', unlockedDate: `${m0}-01` }],
    lessonsSeen: [
      { lessonId: 1, firstShownDate: `${m0}-01` },
      { lessonId: 2, firstShownDate: `${m0}-01` },
      { lessonId: 4, firstShownDate: `${m1}-01` },
    ],
    meta: {
      lastSeenLevel: 2,
      lastRecapMonth: m1,
      version: 1,
    },
    renown: 150,
    decorations: ['flowerbeds'],
    petHappiness: 90,
    completedQuests: ['q_work_1', 'q_market_1'],
    visitedBuildings: ['work', 'market', 'bank'],
    viewMode: 'quest',
  };
}
