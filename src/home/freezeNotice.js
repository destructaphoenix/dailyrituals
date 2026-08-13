import { dayKeyToUtcMs } from '../insights/dateKeys';

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// The candle spend (IMP-039) happens silently on mount — this is the record
// that tells the user about it. Appended, not replaced: the effect is
// mount-only, so a second spend on a later launch must not erase an earlier
// notice the user has not read yet.
export function addFreezeNotice(pending, coveredDays) {
  if (!coveredDays.length) return pending;
  const seen = new Set(pending);
  const added = coveredDays.filter((d) => !seen.has(d));
  return added.length ? [...pending, ...added] : pending;
}

function formatDay(dayKey) {
  const ms = dayKeyToUtcMs(dayKey);
  const d = new Date(ms);
  return `${d.getUTCDate()} ${MONTH_SHORT[d.getUTCMonth()]}`;
}

export function freezeNoticeCopy(days, freezesLeft) {
  if (!days.length) return null;
  const lead = days.length === 1
    ? `You missed ${formatDay(days[0])}. A candle spent itself to keep your streak whole.`
    : `You missed ${days.length} days. ${days.length} candles spent themselves to keep your streak whole.`;
  const tail = freezesLeft === 0 ? 'That was your last one.' : `${freezesLeft} left.`;
  return { title: 'A candle burned for you.', body: `${lead} ${tail}` };
}
