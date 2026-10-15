// Hustle RPG Gameplay Engine & Interactive System

export interface DecorationDef {
  id: string;
  name: string;
  costRenown: number;
  icon: string;
  desc: string;
}

export const TOWN_DECORATIONS: DecorationDef[] = [
  {
    id: 'fountain',
    name: 'Crystal Plaza Fountain',
    costRenown: 40,
    icon: '⛲',
    desc: 'A sparkling stone fountain right in the cobblestone plaza.',
  },
  {
    id: 'lanterns',
    name: 'Golden Street Lanterns',
    costRenown: 30,
    icon: '💡',
    desc: 'Upgrades town streetlamps to warm golden lanterns with glow.',
  },
  {
    id: 'flowerbeds',
    name: 'Blossom Flowerbeds',
    costRenown: 25,
    icon: '🌸',
    desc: 'Lush jasmine and marigold flower borders along the pathways.',
  },
  {
    id: 'park_bench',
    name: 'Riverside Gazebo',
    costRenown: 50,
    icon: '🪵',
    desc: 'A scenic wooden shelter and stone walkway on the east bank.',
  },
  {
    id: 'clocktower',
    name: 'Town Hall Clocktower',
    costRenown: 75,
    icon: '🏰',
    desc: 'An ornate golden bell clocktower atop the Town Hall roof.',
  },
];

export interface NpcDef {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  avatarColor: string;
  shirtColor: string;
  quip: string;
  bounty: {
    id: string;
    title: string;
    desc: string;
    rewardRenown: number;
  };
}

export const TOWN_NPCS: NpcDef[] = [
  {
    id: 'kaka',
    name: 'Kaka (Chai Vendor)',
    role: 'Market Merchant',
    x: 3.8,
    y: 8.6,
    avatarColor: '#5C3826',
    shirtColor: '#E76F51',
    quip: '“Garama-garam chai! Small daily splurges add up, friend. Treat your daily tea with mindfulness!”',
    bounty: {
      id: 'quest_kaka',
      title: 'Mindful Market Day',
      desc: 'Keep your monthly dining or shopping wants below 30%.',
      rewardRenown: 25,
    },
  },
  {
    id: 'uncle_sharma',
    name: 'Uncle Sharma',
    role: 'Town Accountant',
    x: 7.6,
    y: 6.8,
    avatarColor: '#9AA0A8',
    shirtColor: '#2A9D8F',
    quip: '“A rupee saved is more than a rupee earned because of compound interest! Check your loan EMI at the Bank.”',
    bounty: {
      id: 'quest_sharma',
      title: 'Audit the Books',
      desc: 'Visit the Bank simulator or Town Hall analytics.',
      rewardRenown: 30,
    },
  },
  {
    id: 'priya',
    name: 'Priya',
    role: 'Aspiring Scholar',
    x: 7.2,
    y: 8.8,
    avatarColor: '#2C1810',
    shirtColor: '#9B5DE5',
    quip: '“I unlocked 3 wisdom scrolls at the School this week. Financial literacy is the highest ROI investment you will ever make!”',
    bounty: {
      id: 'quest_priya',
      title: 'Wisdom Scroll Test',
      desc: 'Ace the School financial quiz.',
      rewardRenown: 35,
    },
  },
];

export interface DilemmaChoice {
  text: string;
  cost?: number;
  savingsAdd?: number;
  renownAdd: number;
  explanation: string;
}

export interface Dilemma {
  id: string;
  title: string;
  scenario: string;
  optionA: DilemmaChoice;
  optionB: DilemmaChoice;
}

export const FINANCIAL_DILEMMAS: Dilemma[] = [
  {
    id: 'dilemma_scooter',
    title: '🛵 The Sudden Scooter Breakdown',
    scenario: 'Your scooter engine made a loud clunking noise on the morning commute! The mechanic says the drive belt snapped and asks for ₹1,200 for an immediate repair.',
    optionA: {
      text: 'Pay ₹1,200 from Emergency Buffer',
      cost: 1200,
      renownAdd: 40,
      explanation: 'Wise move! This is exactly why we maintain an emergency cushion: zero debt, zero interest.',
    },
    optionB: {
      text: 'Put it on 3-Month EMI (₹450/mo = ₹1,350 total)',
      renownAdd: 10,
      explanation: 'Convenient today, but you paid ₹150 extra in finance charges and created a monthly liability.',
    },
  },
  {
    id: 'dilemma_bonus',
    title: '🎁 Surprise Cash Gift',
    scenario: 'You received an unexpected ₹2,000 festive bonus for helping a neighborhood family with weekend event logistics!',
    optionA: {
      text: 'Stash ₹2,000 into Vault Savings Goal',
      savingsAdd: 2000,
      renownAdd: 50,
      explanation: 'Pay Yourself First! Saving windfalls instead of absorbing them into lifestyle accelerates your freedom.',
    },
    optionB: {
      text: 'Throw a Celebration Dinner with Friends',
      cost: 2000,
      renownAdd: 20,
      explanation: 'Memories are precious, but lifestyle creep happens when every bonus gets immediately spent.',
    },
  },
  {
    id: 'dilemma_sale',
    title: '🏷️ The 40% Off Flash Sale',
    scenario: 'A flash notification pops up: noise-canceling headphones you vaguely liked are on sale for ₹2,999 down from ₹5,000. The timer warns: "Sale ends in 1 hour!"',
    optionA: {
      text: 'Apply the 48-Hour Cool-Off Rule (Walk Away)',
      renownAdd: 45,
      explanation: 'Masterful impulse control! If you didn’t need it before the sale, 40% off is still 100% money spent.',
    },
    optionB: {
      text: 'Buy Now — "I am saving ₹2,000!"',
      cost: 2999,
      renownAdd: 5,
      explanation: 'Classic retail mind trick! You didn\'t save ₹2,000; you spent ₹2,999 on a non-essential want.',
    },
  },
];

export interface NeedsWantsItem {
  id: string;
  name: string;
  type: 'need' | 'want';
  category: string;
  icon: string;
}

export const NEEDS_WANTS_ITEMS: NeedsWantsItem[] = [
  { id: '1', name: 'Monthly Rice & Groceries', type: 'need', category: 'Food', icon: '🍚' },
  { id: '2', name: 'Designer High-Top Sneakers', type: 'want', category: 'Shopping', icon: '👟' },
  { id: '3', name: 'Apartment Electricity Bill', type: 'need', category: 'Bills', icon: '⚡' },
  { id: '4', name: 'Gaming Console Game Pass', type: 'want', category: 'Fun', icon: '🎮' },
  { id: '5', name: 'Prescription Doctor Medicine', type: 'need', category: 'Health', icon: '💊' },
  { id: '6', name: 'Midnight Food Delivery Treat', type: 'want', category: 'Food', icon: '🍕' },
  { id: '7', name: 'Monthly City Metro Pass', type: 'need', category: 'Transport', icon: '🚇' },
  { id: '8', name: 'Premium Espresso Drink', type: 'want', category: 'Food', icon: '☕' },
  { id: '9', name: 'Monthly Home Rent', type: 'need', category: 'Rent', icon: '🏠' },
  { id: '10', name: 'Smartwatch Luxury Strap', type: 'want', category: 'Shopping', icon: '⌚' },
  { id: '11', name: 'Basic Mobile Data Recharge', type: 'need', category: 'Bills', icon: '📱' },
  { id: '12', name: 'Weekend Clubbing / Lounge Party', type: 'want', category: 'Fun', icon: '🍸' },
  { id: '13', name: 'Annual Health & Life Insurance', type: 'need', category: 'Health', icon: '🛡️' },
  { id: '14', name: 'Brand Name Coffee Machine', type: 'want', category: 'Shopping', icon: '🫖' },
  { id: '15', name: 'Cooking Gas Cylinder (LPG)', type: 'need', category: 'Bills', icon: '🔥' },
  { id: '16', name: 'Impulse Online Sale Flash Buy', type: 'want', category: 'Shopping', icon: '🛍️' },
];

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  book: string;
  explanation: string;
}

export const FINANCIAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'According to "Rich Dad Poor Dad", what is the real definition of an Asset?',
    options: [
      'Anything that you paid a lot of money to buy',
      'Something that puts money into your pocket over time',
      'A luxury car parked in your driveway',
      'Your personal credit limit',
    ],
    correctIndex: 1,
    book: 'Rich Dad Poor Dad',
    explanation: 'An asset puts cash into your pocket (savings, investments, income-generating skills). A liability takes cash out.',
  },
  {
    id: 'q2',
    question: 'In "The Psychology of Money", why is an Emergency Buffer of 3–6 months essential?',
    options: [
      'It prevents you from having to sell assets or take bad debt during a crisis',
      'It guarantees you can buy gadgets whenever you want',
      'It increases your credit card limit',
      'It replaces the need to invest in index funds',
    ],
    correctIndex: 0,
    book: 'The Psychology of Money',
    explanation: 'A cash cushion buys peace of mind and flexibility, preventing desperate high-interest borrowing during emergencies.',
  },
  {
    id: 'q3',
    question: 'What does "Pay Yourself First" (The Richest Man in Babylon) actually mean?',
    options: [
      'Spend your paycheck on luxury gifts before paying bills',
      'Automatically divert a slice (e.g. 10–20%) into savings before spending on rent and wants',
      'Never pay your utilities until the final due date',
      'Take personal loans to fund current desires',
    ],
    correctIndex: 1,
    book: 'The Richest Man in Babylon',
    explanation: 'Treat your savings like the most non-negotiable bill of all—paid directly to your future self the day income arrives.',
  },
];
