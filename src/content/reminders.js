// reminders.js — warm, non-nagging notification copy. Rotated date-seeded
// (see time/dailyPick.js, IMP-023's pattern) rather than fixed, so the
// rolling-window design (schedule.js) doesn't have to repeat the same string
// every night. No streak-shaming, no guilt.
import { pickForDay } from '../time/dailyPick';

const GENTLE = [
  { title: 'A quiet moment', body: "A few honest words about today, whenever you're ready." },
  { title: 'Before today slips away', body: "Your reflection is here whenever you'd like it." },
  { title: 'Just checking in', body: 'How did today feel? No rush — jot it down when it suits you.' },
];

const PLAYFUL = [
  { title: 'Psst — today needs a few words', body: "Don't let it slip away undocumented." },
  { title: 'Your streak is waiting', body: 'One quick reflection keeps the ember lit.' },
  { title: "Diary o'clock", body: "Give today a proper send-off before it's gone." },
];

const POOLS = { gentle: GENTLE, playful: PLAYFUL };

// Distinct salt from other daily picks (greeting uses the default 0) so the
// reminder message doesn't rotate in lockstep with anything else.
const SALT = 41;

export function reminderCopy(tone, date = new Date()) {
  const pool = POOLS[tone] || POOLS.gentle;
  return pickForDay(pool, date, SALT);
}
