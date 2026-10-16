// Hustle Financial Teaching Engine
// Just-in-Time Nudges, Opportunity Cost Time Machine, Behavioral Biases, Indian Benchmarks, and Socratic Dialogues

import { Transaction } from './types';
import { LESSONS } from './constants';

export interface ContextualNudge {
  id: string;
  character: 'kaka' | 'uncle_sharma' | 'priya';
  characterName: string;
  characterRole: string;
  avatarEmoji: string;
  shirtColor: string;
  title: string;
  subtitle: string;
  quote: string;
  calculationBox?: {
    label: string;
    value: string;
    comparison: string;
  };
  primaryAction: {
    label: string;
    actionType: 'time_machine' | 'dismiss' | 'wishlist_accept';
    href?: string;
  };
  secondaryAction?: {
    label: string;
    actionType: 'dismiss' | 'time_machine';
    href?: string;
  };
  rewardRenown?: number;
}

// Helper: Calculate SIP Future Value at annual rate r compounded monthly
export function calculateSipFv(monthlyAmount: number, annualRate: number, years: number): number {
  const i = annualRate / 12;
  const n = years * 12;
  if (i === 0) return monthlyAmount * n;
  return monthlyAmount * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
}

// Helper: Format Rupee amounts into Lakhs or Crores if large
export function formatInr(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

// 1. Just-In-Time Contextual Nudge Evaluator
export function evaluateContextualNudge(
  tx: Omit<Transaction, 'id' | 'source'>,
  history: Transaction[],
  currentBalance: number
): ContextualNudge | null {
  if (tx.type !== 'expense') return null;

  // Trigger 2: Zero / Negative Balance (Emergency Buffer Alert)
  const remainingBalance = currentBalance - tx.amount;
  if (remainingBalance <= 0) {
    return {
      id: `nudge_zero_buffer_${Date.now()}`,
      character: 'uncle_sharma',
      characterName: 'Uncle Sharma',
      characterRole: 'Town Accountant',
      avatarEmoji: '👓',
      shirtColor: '#2A9D8F',
      title: '🚨 Zero Cushion Warning',
      subtitle: 'The Emergency Buffer Shield',
      quote:
        '“Your account just hit zero. In real life, banks charge ₹450 + 18% GST for ECS bounce fees, plus high overdraft penalties. An emergency buffer of 3-6 months isn’t an investment—it is an insurance shield for your mental health!”',
      calculationBox: {
        label: 'Minimum Safety Shield',
        value: '₹30,000 – ₹90,000',
        comparison: 'Stashed in a liquid fund / sweep-in FD before any stock investments.',
      },
      primaryAction: {
        label: 'Got it, Uncle Sharma (+15 ⭐)',
        actionType: 'dismiss',
      },
      secondaryAction: {
        label: 'View School Wisdom',
        actionType: 'time_machine',
        href: '/school',
      },
      rewardRenown: 15,
    };
  }

  // Trigger 3: The 48-Hour Wishlist challenge for high-ticket wants (>= ₹2,000)
  if (tx.tag === 'want' && tx.amount >= 2000) {
    return {
      id: `nudge_wishlist_48h_${Date.now()}`,
      character: 'priya',
      characterName: 'Priya',
      characterRole: 'Behavioral Psychology Scholar',
      avatarEmoji: '📚',
      shirtColor: '#9B5DE5',
      title: '⏳ The 48-Hour Wishlist Rule',
      subtitle: 'Hyperbolic Discounting Antidote',
      quote: `“You are logging a Want of ₹${tx.amount.toLocaleString('en-IN')}. Neurologists know our brain seeks immediate dopamine. Try the 48-Hour Rule: delay this purchase for two days. If you still crave it, buy it without guilt. If the urge passes, you just saved ₹${tx.amount.toLocaleString('en-IN')}!”`,
      calculationBox: {
        label: 'Immediate Psychology Challenge',
        value: `Save ₹${tx.amount.toLocaleString('en-IN')}`,
        comparison: 'Delaying impulse purchases cuts discretionary spending by 35% on average.',
      },
      primaryAction: {
        label: 'Accept 48h Challenge (+30 ⭐)',
        actionType: 'wishlist_accept',
      },
      secondaryAction: {
        label: 'Log Purchase Anyway',
        actionType: 'dismiss',
      },
      rewardRenown: 30,
    };
  }

  // Trigger 1: Overspending on Wants / Restaurant Deliveries (3rd want/food in 7 days)
  const isWantOrFood = tx.tag === 'want' || tx.categoryId === 'cat_food';
  if (isWantOrFood) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysIso = sevenDaysAgo.toISOString().split('T')[0];

    const recentWants = history.filter(
      (h) =>
        h.type === 'expense' &&
        h.date >= sevenDaysIso &&
        (h.tag === 'want' || h.categoryId === 'cat_food')
    );

    // If this is the 3rd or more in the week
    if (recentWants.length >= 2) {
      const monthlyEquivalent = tx.amount * 4; // roughly 4 times a month
      const tenYrIndexFv = calculateSipFv(monthlyEquivalent, 0.12, 10);

      return {
        id: `nudge_wants_kaka_${Date.now()}`,
        character: 'kaka',
        characterName: 'Kaka',
        characterRole: 'Chai Vendor & Street Economist',
        avatarEmoji: '☕',
        shirtColor: '#E76F51',
        title: '☕ Bhai, Chai Pe Charcha!',
        subtitle: 'The Takeout Opportunity Cost',
        quote: `“Bhai, ₹${tx.amount.toLocaleString('en-IN')} on delivery or dining is fine once in a while. But this is your 3rd treat this week! That same ₹${monthlyEquivalent.toLocaleString('en-IN')}/month invested in a Nifty 50 index fund at 12% CAGR becomes ${formatInr(tenYrIndexFv)} in 10 years! That’s your next car down payment eaten by takeout.”`,
        calculationBox: {
          label: '10-Year Opportunity Cost',
          value: formatInr(tenYrIndexFv),
          comparison: `₹${monthlyEquivalent.toLocaleString('en-IN')}/mo at 12% vs ₹0 in delivery containers.`,
        },
        primaryAction: {
          label: 'Show Me in Time Machine ➔',
          actionType: 'time_machine',
          href: '/school?tab=timemachine',
        },
        secondaryAction: {
          label: 'I Understand, Kaka (+15 ⭐)',
          actionType: 'dismiss',
        },
        rewardRenown: 15,
      };
    }
  }

  return null;
}

// 2. The Opportunity Cost Time Machine Math Engine
export interface TimeMachinePoint {
  year: number;
  principal: number;
  cashPurchasingPower: number; // Eroded by 6% inflation
  fdValue: number; // 6.5% pre-tax (effectively ~5% after taxes/inflation)
  niftyValue: number; // 12% CAGR historical index compounding
}

export interface OpportunityCostResult {
  dailyAmount: number;
  monthlyAmount: number;
  annualAmount: number;
  years: number;
  totalInvested: number;
  cashPurchasingPower: number;
  inflationLoss: number;
  fdValue: number;
  niftyValue: number;
  opportunityCostGap: number;
  ruleOf72Doublings: number;
  chartPoints: TimeMachinePoint[];
}

export function calculateOpportunityCostEngine(
  dailyAmount: number,
  years: number
): OpportunityCostResult {
  const monthlyAmount = Math.round((dailyAmount * 365) / 12);
  const annualAmount = dailyAmount * 365;
  const totalInvested = annualAmount * years;

  const points: TimeMachinePoint[] = [];

  for (let y = 0; y <= years; y++) {
    if (y === 0) {
      points.push({
        year: 0,
        principal: 0,
        cashPurchasingPower: 0,
        fdValue: 0,
        niftyValue: 0,
      });
      continue;
    }

    const principal = annualAmount * y;

    // Cash with 6% inflation drag: PV = sum_{t=1..y} annual / (1.06)^t
    let cashPV = 0;
    for (let t = 1; t <= y; t++) {
      cashPV += annualAmount / Math.pow(1.06, t);
    }

    // FD at 6.5% CAGR (compounded monthly)
    const fd = calculateSipFv(monthlyAmount, 0.065, y);

    // Nifty 50 at 12% CAGR (compounded monthly)
    const nifty = calculateSipFv(monthlyAmount, 0.12, y);

    points.push({
      year: y,
      principal: Math.round(principal),
      cashPurchasingPower: Math.round(cashPV),
      fdValue: Math.round(fd),
      niftyValue: Math.round(nifty),
    });
  }

  const lastPoint = points[points.length - 1];
  const niftyVal = lastPoint.niftyValue;
  const fdVal = lastPoint.fdValue;
  const cashPV = lastPoint.cashPurchasingPower;
  const inflationLoss = totalInvested - cashPV;
  const opportunityCostGap = niftyVal - totalInvested;
  const ruleOf72Doublings = Number((years / (72 / 12)).toFixed(1));

  return {
    dailyAmount,
    monthlyAmount,
    annualAmount,
    years,
    totalInvested,
    cashPurchasingPower: cashPV,
    inflationLoss,
    fdValue: fdVal,
    niftyValue: niftyVal,
    opportunityCostGap,
    ruleOf72Doublings,
    chartPoints: points,
  };
}

// 3. Behavioral Bias Simulations (Human Psychology)
export interface BehavioralBiasChallenge {
  id: string;
  name: string;
  bookSource: string;
  author: string;
  tagline: string;
  scenario: string;
  options: {
    text: string;
    isCorrect: boolean;
    feedback: string;
    renownDelta: number;
  }[];
  psychologyInsight: string;
  actionableRule: string;
}

export const BEHAVIORAL_BIASES: BehavioralBiasChallenge[] = [
  {
    id: 'bias_present_bias',
    name: 'Present Bias (Hyperbolic Discounting)',
    bookSource: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    tagline: 'Why current dopamine crushes your 60-year-old self.',
    scenario:
      'You see a flash deal for a gaming accessory or designer jacket costing ₹4,500. You don’t have immediate savings earmarked, but UPI payment takes exactly 4 seconds. How does your brain frame this decision?',
    options: [
      {
        text: '“I work hard, I deserve to treat myself right now!”',
        isCorrect: false,
        feedback:
          'Classic Hyperbolic Discounting! Our primitive brain values immediate ₹4,500 pleasure at 10x the value of ₹45,000 in your future retirement account.',
        renownDelta: 5,
      },
      {
        text: '“Shelve it on the 48-Hour Wishlist. If I still crave it in 2 days, I buy it.”',
        isCorrect: true,
        feedback:
          'Spot on! Delay creates cognitive friction, giving your rational prefrontal cortex time to cool down the dopamine spike. 70% of delayed items are never bought.',
        renownDelta: 30,
      },
    ],
    psychologyInsight:
      'Humans are biologically wired to survive today, not 30 years from now. Immediate rewards trigger dopamine; delayed rewards trigger nothing until automated.',
    actionableRule:
      'The 48-Hour Rule: Never buy a non-essential item over ₹2,000 on the same day you discover it.',
  },
  {
    id: 'bias_anchoring',
    name: 'The Anchoring Effect ("The 40% Off Trap")',
    bookSource: 'The Psychology of Money',
    author: 'Morgan Housel',
    tagline: 'Retailers anchor your brain to an artificial price tag.',
    scenario:
      'A luxury jacket has a sticker that says: "MRP ₹8,000 — 50% OFF TODAY — Pay only ₹4,000!". You walk away having spent ₹4,000. What actually happened?',
    options: [
      {
        text: 'I saved ₹4,000 on a top quality item!',
        isCorrect: false,
        feedback:
          'Retail trap triggered! You didn’t save ₹4,000; you depleted your net worth by ₹4,000 on an unbudgeted item.',
        renownDelta: 5,
      },
      {
        text: 'I spent ₹4,000 that wasn’t in my original month plan.',
        isCorrect: true,
        feedback:
          'Excellent! You recognized the Anchor. The ₹8,000 was fabricated to make ₹4,000 feel like a triumph instead of an expense.',
        renownDelta: 30,
      },
    ],
    psychologyInsight:
      'The initial number presented (the anchor) warps all subsequent value judgements. Discount percentages are psychological anesthetic for spending.',
    actionableRule:
      'Judge purchases by the absolute rupees leaving your wallet, never by the crossed-out MRP.',
  },
  {
    id: 'bias_sunk_cost',
    name: 'Sunk Cost Fallacy ("The Endless Repair Trap")',
    bookSource: 'Predictably Irrational',
    author: 'Dan Ariely',
    tagline: 'Pouring good money after bad to justify past mistakes.',
    scenario:
      'Uncle Sharma’s 15-year-old scooter broke down again. He has spent ₹18,000 on repairs over the past 8 months. The mechanic asks for another ₹4,500. Uncle Sharma sighs: "I already spent so much, I can\'t quit now!" What should he do?',
    options: [
      {
        text: 'Pay the ₹4,500 because the previous ₹18,000 will be wasted otherwise.',
        isCorrect: false,
        feedback:
          'Sunk Cost Fallacy! The ₹18,000 is gone forever whether he fixes it or not. Future decisions must be evaluated solely on future reliability and cost.',
        renownDelta: 5,
      },
      {
        text: 'Cut losses, sell for scrap/parts, and switch to public transit or a reliable commuter.',
        isCorrect: true,
        feedback:
          'Brave and rational! When a liability repeatedly bleeds cash, acknowledging the past loss stops the ongoing cash hemorrhage.',
        renownDelta: 30,
      },
    ],
    psychologyInsight:
      'Admitting a past investment was a dead end feels like admitting personal failure. To avoid this emotional sting, humans double down on losing bets.',
    actionableRule:
      'Past spent money is water under the bridge. Only ask: "What gives the highest return on my next ₹1,000?"',
  },
  {
    id: 'bias_lifestyle_creep',
    name: 'Lifestyle Creep ("The Golden Handcuffs")',
    bookSource: 'The Millionaire Next Door',
    author: 'Thomas J. Stanley',
    tagline: 'When expenses rise in exact lockstep with your promotions.',
    scenario:
      'Congratulations! You got a promotion with a ₹25,000/month salary raise. Your peers immediately sign leases for luxury high-rise flats and finance new SUVs. How do you handle your new income?',
    options: [
      {
        text: 'Upgrade apartment and car immediately; my status must match my salary.',
        isCorrect: false,
        feedback:
          'The Hedonic Treadmill wins! In 6 months, the new apartment feels normal, your fixed obligations doubled, and your savings rate is still 0%.',
        renownDelta: 5,
      },
      {
        text: 'Keep fixed living costs stable, reward yourself with 20%, and automate 80% (₹20,000/mo) into index compounding.',
        isCorrect: true,
        feedback:
          'Genius move! By banking 80% of salary increments, you maintain happiness while cutting your years to financial independence in half.',
        renownDelta: 35,
      },
    ],
    psychologyInsight:
      'Lifestyle inflation is invisible because each upgrade feels well-earned. But high fixed costs eliminate freedom and make layoffs catastrophic.',
    actionableRule:
      'The 70/30 Increment Rule: Whenever income jumps, bank at least 70% of the raise before your lifestyle inflates.',
  },
];

// 4. Grounded Real Indian Financial Benchmarks
export interface IndianBenchmark {
  id: string;
  title: string;
  badge: string;
  benchmarkRule: string;
  whyItMatters: string;
  indianContext: string;
  actionableStep: string;
}

export const INDIAN_BENCHMARKS: IndianBenchmark[] = [
  {
    id: 'bm_30_emi_cap',
    title: 'The 30%–35% Fixed EMI Ceiling',
    badge: 'DEBT DEFENSE',
    benchmarkRule: 'Total monthly loan EMIs (Home + Car + Personal) must never exceed 30–35% of net in-hand monthly salary.',
    whyItMatters:
      'Banks will happily approve loans up to 50% of your salary. But if 50% goes to EMI and 30% to living costs, a single medical emergency or job disruption causes immediate default.',
    indianContext:
      'With floating home loan interest rates in India cycling between 6.5% and 9.5%, a rate hike can increase your loan tenure by 7 years overnight if your EMI is already stretched.',
    actionableStep:
      'If your salary is ₹60,000, your maximum total monthly loan EMI must be capped at ₹18,000 – ₹21,000.',
  },
  {
    id: 'bm_term_vs_ulip',
    title: 'Pure Term Life vs. Traditional ULIP / Endowment Trap',
    badge: 'INSURANCE CLARITY',
    benchmarkRule: 'Never mix insurance with investment. Buy pure Term Life Insurance + invest the difference in direct Index Funds.',
    whyItMatters:
      'Traditional "money-back" endowment plans and ULIPs offer dismal 4%–5.5% returns (failing to beat Indian inflation) with heavy agent commissions (20%–35% in Year 1).',
    indianContext:
      'A 28-year-old can get a ₹1 Crore pure Term Life cover till age 60 for just ₹8,000 – ₹10,000 per YEAR. Paying ₹1 Lakh/year into a traditional policy yields far less life cover and poor returns.',
    actionableStep:
      'Rule of thumb: Buy Term Insurance cover equal to 15x–20x your annual gross income. Keep all investments in transparent index/mutual funds.',
  },
  {
    id: 'bm_medical_inflation',
    title: 'The 14% Healthcare Inflation Shield',
    badge: 'MEDICAL FORTRESS',
    benchmarkRule: 'Maintain family health insurance with a Super Top-Up + dedicated ₹1 Lakh liquid emergency buffer.',
    whyItMatters:
      'Healthcare inflation in India runs at 14% per annum—double headline CPI inflation. A single cardiac or critical care hospitalisation in private metro hospitals costs ₹6–12 Lakhs.',
    indianContext:
      'Relying solely on employer-provided health insurance is dangerous because coverage terminates the moment you change jobs, get laid off, or retire.',
    actionableStep:
      'Secure an independent personal base cover (₹5–10 Lakhs) + a ₹20–50 Lakh Super Top-Up policy (which costs only ~₹4,000/year).',
  },
  {
    id: 'bm_tax_efficient_stack',
    title: 'The Indian Tax-Smart Compounding Stack',
    badge: 'WEALTH COMPACTION',
    benchmarkRule: 'Maximize EEE (Exempt-Exempt-Exempt) vehicles like PPF & EPF, SGBs, and low-cost Equity Index Funds.',
    whyItMatters:
      'Taxes drag compound growth significantly. Understanding tax-exempt buckets saves lakhs in wealth erosion over decades.',
    indianContext:
      'PPF offers sovereign-guaranteed interest completely tax-free on withdrawal. Direct mutual funds offer long-term compounding with 12.5% LTCG above ₹1.25 Lakh/year.',
    actionableStep:
      'Use EPF/PPF as your guaranteed debt cornerstone, and direct Nifty 50 Index Funds for equity compounding.',
  },
];

// 5. Socratic Dialogue with Villagers
export interface SocraticDialogue {
  npcId: string;
  npcName: string;
  npcRole: string;
  avatarEmoji: string;
  question: string;
  optionA: {
    text: string;
    isCorrect: boolean;
    feedback: string;
  };
  optionB: {
    text: string;
    isCorrect: boolean;
    feedback: string;
  };
  rewardRenown: number;
  unlocksLessonId?: number;
}

export const SOCRATIC_DIALOGUES: Record<string, SocraticDialogue[]> = {
  uncle_sharma: [
    {
      npcId: 'uncle_sharma',
      npcName: 'Uncle Sharma',
      npcRole: 'Town Accountant',
      avatarEmoji: '👓',
      question:
        '“A sleek bank brochure arrived offering a ‘Lifetime Free’ credit card with ₹50,000 limit and 5% cashback on fashion. Is this free money?”',
      optionA: {
        text: 'Yes! 5% cashback means I save on everything I buy.',
        isCorrect: false,
        feedback:
          '“Careful, beta! Credit card companies don’t give free money. They make billions on the 42% APR interest and ₹1,000 late fees charged the moment someone misses paying 100% on the due date!”',
      },
      optionB: {
        text: 'No. They profit from 42% APR interest when users don’t pay the total due in full.',
        isCorrect: true,
        feedback:
          '“Shabash! You see through the illusion. A credit card is a convenient payment tool only if treated like a debit card and paid 100% before the due date.”',
      },
      rewardRenown: 25,
      unlocksLessonId: 2,
    },
    {
      npcId: 'uncle_sharma',
      npcName: 'Uncle Sharma',
      npcRole: 'Town Accountant',
      avatarEmoji: '👓',
      question:
        '“A friend says: ‘I earn ₹50,000 and the bank approved my ₹25,000 monthly car EMI. I can easily afford it!’ What do you tell him?”',
      optionA: {
        text: 'That’s 50% of his salary! The 30% Fixed EMI Cap says his loans must stay under ₹15,000.',
        isCorrect: true,
        feedback:
          '“Exactly right! An EMI above 35% turns any unexpected shock into a debt spiral. Cars depreciate while loan interest compounds against you!”',
      },
      optionB: {
        text: 'If the bank approved it, the mathematical risk has already been cleared.',
        isCorrect: false,
        feedback:
          '“Never trust a bank to limit your risk! Banks want you in high EMI contracts because your interest is their revenue.”',
      },
      rewardRenown: 25,
      unlocksLessonId: 8,
    },
  ],
  kaka: [
    {
      npcId: 'kaka',
      npcName: 'Kaka',
      npcRole: 'Chai Vendor',
      avatarEmoji: '☕',
      question:
        '“A customer laughed at me today: ‘Kaka, tracking a ₹100 daily snack or coffee is penny-pinching; only big expenses matter!’ What say you?”',
      optionA: {
        text: 'He has a point; life is short, small expenses don’t move the needle.',
        isCorrect: false,
        feedback:
          '“Arre bhai! ₹100 a day is ₹36,500 every single year. In 10 years at 12% in an index fund, that is ₹7.2 Lakhs! Small leaks sink great ships.”',
      },
      optionB: {
        text: '₹100/day = ₹36,500/year! Invested at 12%, that’s over ₹7 Lakhs in 10 years.',
        isCorrect: true,
        feedback:
          '“Wah! You understand the power of compound interest! Mindful daily habits build empires. Have a warm cup on the house!”',
      },
      rewardRenown: 25,
      unlocksLessonId: 3,
    },
    {
      npcId: 'kaka',
      npcName: 'Kaka',
      npcRole: 'Chai Vendor',
      avatarEmoji: '☕',
      question:
        '“When salary arrives on the 1st of the month, what should be the very first transaction you execute?”',
      optionA: {
        text: 'Pay Yourself First: Move 20% into savings/SIP before paying bills and wants.',
        isCorrect: true,
        feedback:
          '“Spot on! Babylon’s oldest secret: treat savings like a sacred bill you owe your future self, not whatever happens to be left over.”',
      },
      optionB: {
        text: 'Pay all utilities and party on the weekend, then save whatever remains at month-end.',
        isCorrect: false,
        feedback:
          '“If you wait to save whatever is left, the balance is always zero by day 28. Human nature expands expenses to match all visible cash!”',
      },
      rewardRenown: 25,
      unlocksLessonId: 1,
    },
  ],
  priya: [
    {
      npcId: 'priya',
      npcName: 'Priya',
      npcRole: 'Aspiring Scholar',
      avatarEmoji: '📚',
      question:
        '“An insurance agent is pitching my cousin an ‘endowment plan’: pay ₹60,000 every year for 15 years, and get a ‘guaranteed’ lump sum back. Should she sign?”',
      optionA: {
        text: 'Never mix insurance and investment! Returns are barely 5%. Buy Term cover + invest the rest.',
        isCorrect: true,
        feedback:
          '“Brilliant analysis! Traditional plans give paltry returns below inflation while the agent pockets 30% first-year commissions. Pure term insurance is 10x cheaper and gives 5x more life cover!”',
      },
      optionB: {
        text: 'Yes! ‘Guaranteed’ returns from insurance companies are the safest investment in India.',
        isCorrect: false,
        feedback:
          '“Alas! ‘Guaranteed’ 5% return when education and healthcare inflation is 10-14% actually guarantees a loss of real purchasing power!”',
      },
      rewardRenown: 25,
      unlocksLessonId: 5,
    },
    {
      npcId: 'priya',
      npcName: 'Priya',
      npcRole: 'Aspiring Scholar',
      avatarEmoji: '📚',
      question:
        '“Why is relying solely on your employer-provided health insurance card a dangerous gamble in India?”',
      optionA: {
        text: 'Because employer coverage ends the instant you switch jobs, get laid off, or retire.',
        isCorrect: true,
        feedback:
          '“Exactly! And if you contract an illness while between jobs, no private insurer will cover your pre-existing condition later. An independent personal policy is non-negotiable.”',
      },
      optionB: {
        text: 'Corporate plans are always fraud and never pay hospital bills.',
        isCorrect: false,
        feedback:
          '“Corporate plans do pay, but they evaporate the day your employment status changes. Personal health defense must be independent of your job.”',
      },
      rewardRenown: 25,
      unlocksLessonId: 5,
    },
  ],
};

// 6. Complete Town Financial Library / Book Mode Data
export interface BookChapter {
  id: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  icon: string;
  readingTime: string;
  sections: {
    heading: string;
    content: string;
    takeawayBox?: string;
    quote?: { text: string; author: string };
  }[];
}

export const TOWN_LIBRARY_BOOK: BookChapter[] = [
  {
    id: 'ch_classic_models',
    chapterNumber: 1,
    title: 'The 8 Classic Mental Models',
    subtitle: 'Timeless principles distilled from the world’s greatest financial literature',
    icon: '📜',
    readingTime: '6 min read',
    sections: [
      {
        heading: '1. Pay Yourself First (The Richest Man in Babylon)',
        content:
          'Before you pay your landlord, the grocer, the electricity board, or the restaurant, a portion of all you earn is yours to keep. If you wait to save whatever remains at the end of the month, the balance is always zero. Human psychology naturally expands expenses to consume all available liquidity. Moving 10%–20% into an automated investment account the hour salary hits treats your future self like the most important creditor.',
        takeawayBox: 'Action: Set up your automated mutual fund SIP on the 2nd of every month, right after payday.',
        quote: {
          text: 'A part of all you earn is yours to keep. It should be not less than a tenth, no matter how little you earn.',
          author: 'George S. Clason, The Richest Man in Babylon',
        },
      },
      {
        heading: '2. Assets Put Money In, Liabilities Take Money Out (Rich Dad Poor Dad)',
        content:
          'The rich acquire assets; the poor and middle class acquire liabilities that they think are assets. A luxury car, high-end electronics on EMI, and designer clothing are financial liabilities—they immediately begin draining cash for maintenance, fuel, and interest charges. An asset is an index fund, a rental property, a high-yield business, or a sovereign gold bond that silently works for you 24 hours a day.',
        takeawayBox: 'Action: Before signing any loan or EMI contract, ask: "Will this put rupees in my pocket 5 years from now, or take them out?"',
        quote: {
          text: 'Rich people acquire assets. The poor and middle class acquire liabilities that they think are assets.',
          author: 'Robert Kiyosaki, Rich Dad Poor Dad',
        },
      },
      {
        heading: '3. Margin of Safety & The Emergency Buffer (The Psychology of Money)',
        content:
          'The most important part of every plan is planning on your plan not going according to plan. A buffer of 3 to 6 months of living expenses stashed in liquid instruments gives you the superpower to walk away from toxic bosses, survive medical emergencies without high-interest loans, and sleep peacefully during stock market downturns.',
        takeawayBox: 'Action: Never invest in volatile equities until your emergency buffer of at least 3 months is fully parked in a liquid fund or sweep-in FD.',
        quote: {
          text: 'Room for error is the only effective way to safely navigate a world that is governed by odds, not certainties.',
          author: 'Morgan Housel, The Psychology of Money',
        },
      },
    ],
  },
  {
    id: 'ch_indian_benchmarks',
    chapterNumber: 2,
    title: 'Real Indian Financial Benchmarks',
    subtitle: 'Domestic realities, tax efficiency, and family health defense in India',
    icon: '🇮🇳',
    readingTime: '5 min read',
    sections: [
      {
        heading: 'The 30% Fixed EMI Cap Rule',
        content:
          'In India, aggressive retail lending and credit card marketing push consumers into multiple concurrent EMIs. The golden domestic benchmark: Home loan + Car loan + Personal EMIs must never exceed 30%–35% of your net monthly in-hand salary. If your take-home pay is ₹75,000, your maximum combined EMI ceiling is ₹22,500 – ₹26,000.',
        takeawayBox: 'Why: When RBI hikes repo rates, floating loan tenures stretch automatically. If your EMI is already 50% of your salary, a rate cycle hike can trap you in negative amortisation.',
      },
      {
        heading: 'Why Mixing Insurance & Investment Destroys Wealth',
        content:
          'Millions of Indian families fall for traditional endowment policies, money-back plans, and ULIPs marketed by bank managers and relatives. These products yield a dismal 4% to 5.5% return—barely keeping pace with inflation—while offering inadequate life coverage. The mathematical solution: buy a pure Term Life policy (e.g. ₹1.5 Crore cover for ~₹10,000/year) and invest the remaining ₹50,000 into a low-cost direct Nifty 50 Index Fund. Over 25 years, the index fund strategy creates over 4x the wealth of the traditional endowment plan.',
        takeawayBox: 'Rule: Insurance is an expense to protect against catastrophe. Investment is an engine to compound wealth. Keep them strictly separated.',
      },
      {
        heading: '14% Medical Inflation Defense',
        content:
          'Medical inflation in India is running at approximately 14% per annum—double headline consumer inflation. An intensive care bed in a top metro hospital can exceed ₹75,000 per day. Relying on an employer group policy is precarious because you lose coverage the day you transition between jobs or retire. Every family needs an independent personal base policy (₹5–10 Lakhs) combined with a high-deductible Super Top-Up policy (₹25–50 Lakhs) which costs only a few thousand rupees per year.',
        takeawayBox: 'Checklist: (1) Independent personal health cover, (2) Super Top-Up policy, (3) ₹1 Lakh immediate liquid cash buffer.',
      },
    ],
  },
  {
    id: 'ch_behavioral_psychology',
    chapterNumber: 3,
    title: 'Behavioral Psychology & Cognitive Biases',
    subtitle: 'Personal finance is not math; it is human psychology and emotional control',
    icon: '🧠',
    readingTime: '5 min read',
    sections: [
      {
        heading: 'Present Bias & The 48-Hour Wishlist',
        content:
          'Our brains evolved in an environment of immediate scarcity, where consuming food immediately was necessary for survival. In modern consumer society, UPI payments take 4 seconds, satisfying immediate dopamine loops. The antidote is introducing intentional friction: whenever you crave a non-essential item over ₹2,000, force a 48-hour delay. In 70% of cases, the dopamine fever breaks and you preserve your capital.',
        takeawayBox: 'Rule: Add wants to a digital wishlist notes document with a 48-hour timestamp. Only buy if the desire remains intense 2 days later.',
      },
      {
        heading: 'The Anchoring Effect: Why "40% Off" is 100% Spent',
        content:
          'Retailers deliberately price items at artificially inflated MRPs (e.g. ₹6,000) so that offering them at ₹3,500 feels like an irresistible bargain. You feel like you saved ₹2,500, but in reality, your net worth decreased by ₹3,500 on an item you didn’t plan to buy.',
        takeawayBox: 'Mental Model: If you weren’t actively planning to buy it at full price yesterday, a 50% discount today is still 100% money wasted.',
      },
      {
        heading: 'Lifestyle Creep: The 70/30 Increment Rule',
        content:
          'When income rises from ₹40,000 to ₹70,000, people upgrade their apartments, dining habits, and gadgets to match. Within six months, the new level of comfort feels completely baseline, and they feel just as broke as before. To escape the hedonic treadmill, adopt the 70/30 Increment Rule: divert at least 70% of every salary hike or bonus into automated investments before your lifestyle inflates.',
        takeawayBox: 'Golden Rule: Live on last year’s salary for as long as possible while directing all raises into wealth compounding.',
      },
    ],
  },
];
