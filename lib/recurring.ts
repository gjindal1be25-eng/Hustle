import { Recurring, Transaction } from './types';
import { getTodayISO } from './rules';

export function processRecurringTransactions(
  recurringList: Recurring[],
  todayStr?: string
): { updatedRecurring: Recurring[]; newTransactions: Transaction[] } {
  const today = todayStr || getTodayISO();
  const newTransactions: Transaction[] = [];
  const updatedRecurring: Recurring[] = [];

  for (const item of recurringList) {
    if (!item.active) {
      updatedRecurring.push(item);
      continue;
    }

    let currentItem = { ...item };
    const originalStart = new Date(item.startDate + 'T00:00:00Z');
    const startDay = originalStart.getUTCDate();

    // Determine starting point
    let nextDate: Date;
    if (currentItem.lastPostedDate) {
      const last = new Date(currentItem.lastPostedDate + 'T00:00:00Z');
      nextDate = getNextOccurrence(last, item.frequency, startDay);
    } else {
      nextDate = new Date(originalStart);
    }

    while (true) {
      const nextIso = nextDate.toISOString().slice(0, 10);

      // Stop if occurrence is in the future
      if (nextIso > today) {
        break;
      }

      // Stop if occurrence is past endDate
      if (currentItem.endDate && nextIso > currentItem.endDate) {
        currentItem.active = false;
        break;
      }

      // Generate transaction
      newTransactions.push({
        id: `rec_${item.id}_${nextIso}`,
        type: item.type,
        categoryId: item.categoryId,
        tag: item.tag,
        amount: item.amount,
        date: nextIso,
        note: `Recurring: ${item.frequency}`,
        source: 'recurring',
      });

      currentItem.lastPostedDate = nextIso;
      nextDate = getNextOccurrence(nextDate, item.frequency, startDay);
    }

    updatedRecurring.push(currentItem);
  }

  return { updatedRecurring, newTransactions };
}

function getNextOccurrence(current: Date, freq: string, preferredDay: number): Date {
  const next = new Date(current);

  if (freq === 'daily') {
    next.setUTCDate(next.getUTCDate() + 1);
  } else if (freq === 'weekly') {
    next.setUTCDate(next.getUTCDate() + 7);
  } else if (freq === 'monthly') {
    const year = next.getUTCFullYear();
    const month = next.getUTCMonth() + 1; // move to next month
    const maxDays = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const clampedDay = Math.min(preferredDay, maxDays);
    return new Date(Date.UTC(year, month, clampedDay));
  }

  return next;
}
