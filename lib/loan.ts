import { Loan, Transaction } from './types';
import { calculateEMI, getTodayISO } from './rules';

export function postDueLoanEMIs(
  loan: Loan | null,
  existingTransactions: Transaction[],
  todayStr?: string
): { updatedLoan: Loan | null; newTransactions: Transaction[] } {
  if (!loan || !loan.active) {
    return { updatedLoan: loan, newTransactions: [] };
  }

  const today = todayStr || getTodayISO();
  const emi = calculateEMI(loan.principal, loan.annualRatePct, loan.months);
  if (emi <= 0) {
    return { updatedLoan: loan, newTransactions: [] };
  }

  const startDate = new Date(loan.startDate + 'T00:00:00Z');
  const startDay = startDate.getUTCDate();

  // Find all existing loan EMI transactions
  const existingLoanTx = existingTransactions.filter((t) => t.source === 'loan');
  const postedMonths = new Set(existingLoanTx.map((t) => t.date.slice(0, 7)));

  const newTransactions: Transaction[] = [];
  let totalEmisCount = existingLoanTx.length;

  // Iterate month by month from loan startDate
  const cursor = new Date(startDate);
  for (let m = 0; m < loan.months; m++) {
    // Determine the scheduled date for month m
    const year = cursor.getUTCFullYear();
    const month = cursor.getUTCMonth(); // 0-indexed

    // Clamp day to max days in month (e.g. Feb 31 -> Feb 28/29)
    const maxDaysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const targetDay = Math.min(startDay, maxDaysInMonth);

    const scheduledDate = new Date(Date.UTC(year, month, targetDay));
    const scheduledIso = scheduledDate.toISOString().slice(0, 10);
    const scheduledMonthStr = scheduledIso.slice(0, 7);

    // Stop if scheduled date is in the future
    if (scheduledIso > today) {
      break;
    }

    // Check idempotency: if not yet posted for this month
    if (!postedMonths.has(scheduledMonthStr)) {
      totalEmisCount += 1;
      newTransactions.push({
        id: `loan_emi_${scheduledIso}_${Math.random().toString(36).substring(2, 7)}`,
        type: 'expense',
        categoryId: 'cat_loan_emi',
        tag: 'need',
        amount: emi,
        date: scheduledIso,
        note: `Loan EMI (${totalEmisCount}/${loan.months})`,
        source: 'loan',
      });
      postedMonths.add(scheduledMonthStr);
    }

    // Advance cursor to next month
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  // If all EMIs have been posted, mark loan as inactive (cleared)
  const isCompleted = totalEmisCount >= loan.months;
  const updatedLoan: Loan = {
    ...loan,
    active: !isCompleted,
  };

  return { updatedLoan, newTransactions };
}
