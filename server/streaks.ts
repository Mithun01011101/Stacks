const DAY_MS = 24 * 60 * 60 * 1000;

function toMs(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

function toDateString(ms: number): string {
  return new Date(ms).toISOString().split("T")[0];
}

/**
 * Computes habit streaks from the dates (YYYY-MM-DD) that had at least one
 * completed habit.
 *
 * - currentStreak: consecutive active days ending today — or ending yesterday
 *   when today has no completions yet (an unfinished today never breaks a
 *   streak; a missed yesterday does).
 * - longestStreak: longest run of consecutive active days ever.
 */
export function calculateStreaks(completedDates: Iterable<string>): {
  currentStreak: number;
  longestStreak: number;
} {
  const activeDays = new Set(completedDates);
  if (activeDays.size === 0) return { currentStreak: 0, longestStreak: 0 };

  const sorted = Array.from(activeDays).sort();
  let longestStreak = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (toMs(sorted[i]) - toMs(sorted[i - 1]) === DAY_MS) {
      run++;
      if (run > longestStreak) longestStreak = run;
    } else {
      run = 1;
    }
  }

  const today = toDateString(Date.now());
  let cursor: number;
  if (activeDays.has(today)) {
    cursor = toMs(today);
  } else if (activeDays.has(toDateString(toMs(today) - DAY_MS))) {
    cursor = toMs(today) - DAY_MS;
  } else {
    return { currentStreak: 0, longestStreak };
  }

  let currentStreak = 0;
  while (activeDays.has(toDateString(cursor))) {
    currentStreak++;
    cursor -= DAY_MS;
  }

  return { currentStreak, longestStreak };
}
