import { GameState, GameEvent } from './types';
import {
  calculateBalance,
  calculateNetSavings,
  calculateAvgMonthlyIncome,
  calculateSavedMonths,
  calculateLevel,
  calculateLoanSummary,
  calculateGoalProgress,
  getTodayISO,
} from './rules';

export function evaluateEvents(state: GameState, todayStr?: string): GameEvent {
  const today = todayStr || getTodayISO();
  const name = state.profile?.name || 'Hero';
  const openingBal = state.profile?.openingBalance || 0;

  const balance = calculateBalance(openingBal, state.transactions, today);
  const netSavings = calculateNetSavings(state.transactions, today);
  const avgIncome = calculateAvgMonthlyIncome(state.transactions, today);
  const savedMonths = calculateSavedMonths(netSavings, avgIncome);
  const realLevel = calculateLevel(savedMonths);
  const lastSeenLevel = state.meta.lastSeenLevel || 1;

  // Loan metrics
  let emiToIncome = 0;
  let loanSummary = null;
  if (state.loan && state.loan.active) {
    loanSummary = calculateLoanSummary(
      state.loan.principal,
      state.loan.annualRatePct,
      state.loan.months,
      avgIncome
    );
    emiToIncome = loanSummary.emiToIncome;
  }

  // Check Priority 1: Debt Spiral (balance < 0 OR EMI-to-income > 40%)
  const isDebtSpiral =
    balance < 0 || (state.loan && state.loan.active && emiToIncome > 0.4);

  if (isDebtSpiral) {
    const displayedLevel = Math.max(1, realLevel - 1);
    const whyReason =
      balance < 0
        ? `Your balance is negative (₹${balance.toLocaleString('en-IN')}). Spending exceeds all funds.`
        : `Your monthly EMI of ₹${loanSummary?.emi.toLocaleString('en-IN')} consumes ${(emiToIncome * 100).toFixed(0)}% of your average income (safe threshold is 40%).`;

    return {
      priority: 1,
      type: 'debt_spiral',
      scene: 'Bank',
      eventLine:
        'The EMI has joined every meal like an uninvited guest. Time for a recovery plan.',
      whyLine: `Rule: EMI load > 40% or negative cash triggers a debt spiral. ${whyReason}`,
      displayedLevel,
      effect: 'Level reduced by 1 temporarily until financial health recovers.',
      recoveryPlan: [
        '1. Cut or pause spending in your top "want" categories this month.',
        '2. Freeze all new impulse purchases and discretionary wants.',
        '3. Focus cashflow strictly on mandatory needs and the active EMI payment.',
      ],
    };
  }

  // Check Priority 2: Stranded (balance <= 0, but no active spiral)
  if (balance <= 0) {
    return {
      priority: 2,
      type: 'stranded',
      scene: 'Bus stop',
      eventLine: `The bus driver says ₹0 is not a fare. ${name} is now powerwalking home.`,
      whyLine: `Rule: Balance is ₹${balance.toLocaleString('en-IN')}. You need a positive balance to afford daily travel and needs.`,
      displayedLevel: 1,
      effect: 'Character is stranded at the bus stop until new income is logged.',
      recoveryPlan: [
        '1. Log any incoming cash, freelance gig, or allowance.',
        '2. Halt all non-essential expenses immediately.',
      ],
    };
  }

  // Check Priority 3: Goal Reached
  const newlyReachedGoal = state.goals.find((g) => {
    const { isReached } = calculateGoalProgress(g, state.transactions, today);
    return isReached && (!g.reachedDate || g.reachedDate === today);
  });

  if (newlyReachedGoal) {
    return {
      priority: 3,
      type: 'goal_reached',
      scene: 'Celebration',
      eventLine:
        'Goal unlocked! The cart says Pay now and the wallet finally says okay.',
      whyLine: `Rule: Saved ₹${newlyReachedGoal.targetAmount.toLocaleString('en-IN')} for "${newlyReachedGoal.name}". Target achieved!`,
      displayedLevel: realLevel,
      effect: 'Vault glows golden! Confetti celebration in town.',
    };
  }

  // Check Priority 4: Promotion
  if (realLevel > lastSeenLevel) {
    return {
      priority: 4,
      type: 'promotion',
      scene: 'Workplace',
      eventLine: `Level up! ${name}'s ID card just got a shinier photo.`,
      whyLine: `Rule: You have saved ${savedMonths} months of income, which advances you to Level ${realLevel}!`,
      displayedLevel: realLevel,
      effect: 'Workplace building upgraded! New career rank unlocked.',
    };
  }

  // Check Priority 5: Loan Taken recently (active loan with 0 or 1 EMI posted)
  const loanTxCount = state.transactions.filter((t) => t.source === 'loan').length;
  if (state.loan && state.loan.active && loanTxCount <= 1 && loanSummary) {
    return {
      priority: 5,
      type: 'loan_taken',
      scene: 'Bank',
      eventLine:
        'The bank smiled very politely. That was the interest rate talking.',
      whyLine: `Rule: Principal ₹${state.loan.principal.toLocaleString('en-IN')} at ${state.loan.annualRatePct}% requires EMI of ₹${loanSummary.emi.toLocaleString('en-IN')} (${(loanSummary.emiToIncome * 100).toFixed(0)}% of monthly income).`,
      displayedLevel: realLevel,
    };
  }

  // Check Priority 6: Default
  return {
    priority: 6,
    type: 'default',
    scene: 'Home',
    eventLine: `${name} is home, snacking responsibly.`,
    whyLine: `You have saved ${savedMonths >= 0 ? savedMonths : 0} months of income. Current Level: ${realLevel}. Balance: ₹${balance.toLocaleString('en-IN')}.`,
    displayedLevel: realLevel,
  };
}

export function evaluatePerEntryReaction(
  transactionType: 'income' | 'expense',
  tag: 'need' | 'want' | undefined,
  name: string,
  categoryName?: string,
  budgetPct?: number,
  balanceRatio?: number
): { mood: 'happy' | 'neutral' | 'side-eye' | 'worried' | 'sad' | 'celebrating'; message: string } {
  // Priority: budget red, budget amber, low balance, income, want expense, need expense
  if (budgetPct !== undefined && budgetPct >= 1.0) {
    return {
      mood: 'worried',
      message: `${categoryName || 'Category'} is over budget. The piggy bank raised one eyebrow.`,
    };
  }
  if (budgetPct !== undefined && budgetPct >= 0.8) {
    return {
      mood: 'worried',
      message: `${categoryName || 'Category'} is at ${(budgetPct * 100).toFixed(0)}%. Maybe a lighter week?`,
    };
  }
  if (balanceRatio !== undefined && balanceRatio < 0.1) {
    return {
      mood: 'sad',
      message: 'Wallet feels light. Easy on the next one.',
    };
  }
  if (transactionType === 'income') {
    return {
      mood: 'happy',
      message: `Money in! ${name} does a tiny victory dance.`,
    };
  }
  if (tag === 'want') {
    return {
      mood: 'side-eye',
      message: `Fun purchase! ${name} noticed. The wallet noticed too.`,
    };
  }
  return {
    mood: 'neutral',
    message: 'Needs paid. Adulting +1.',
  };
}
