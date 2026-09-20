import { MealEntry } from '../types/types';

export interface StreakInfo {
  streak: number;
  hasLoggedToday: boolean;
  statusBadge: string;
  statusMessage: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  isPending: boolean;
}

/** Formats a timestamp / date into a local date string: YYYY-MM-DD */
export function getLocalDateKey(dateOrMs: number | Date | string): string {
  const d = new Date(dateOrMs);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates user's logging streak based on their meal entries:
 * 1. If at least 1 meal logged today:
 *    - Streak = 1 (today) + consecutive prior days going back
 *    - Status: 🔥 On Fire, "Streak secured for today! 🎉"
 * 2. If haven't logged a meal yet today:
 *    - If logged yesterday: streak from yesterday remains alive awaiting today's meal
 *    - If missed yesterday: streak has reset to 0
 *    - Status: ⏳ Pending, "Log a meal today to keep it active!"
 * 3. If a day was missed:
 *    - Resets to 0 when pending, or starts fresh at 1 as soon as today's first meal is logged
 */
export function calculateStreak(meals: MealEntry[], now: number = Date.now()): StreakInfo {
  const today = new Date(now);
  const todayKey = getLocalDateKey(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getLocalDateKey(yesterday);

  // Collect unique local calendar days with at least 1 meal
  const loggedDates = new Set<string>();
  for (const meal of meals) {
    const time = meal.consumedAt || meal.createdAt;
    if (time) {
      const key = getLocalDateKey(time);
      if (key) loggedDates.add(key);
    }
  }

  const hasLoggedToday = loggedDates.has(todayKey);

  if (hasLoggedToday) {
    // Count consecutive days backwards starting from today (Day 0)
    let streakCount = 0;
    const checkDate = new Date(today);

    while (loggedDates.has(getLocalDateKey(checkDate))) {
      streakCount += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return {
      streak: streakCount,
      hasLoggedToday: true,
      statusBadge: '🔥 On Fire',
      statusMessage: 'Streak secured for today! 🎉',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-700',
      badgeBorder: 'border-orange-200',
      isPending: false,
    };
  } else {
    // Has not logged today yet
    const hasLoggedYesterday = loggedDates.has(yesterdayKey);
    let streakCount = 0;

    if (hasLoggedYesterday) {
      // Streak from yesterday is still active and pending today's meal
      const checkDate = new Date(yesterday);
      while (loggedDates.has(getLocalDateKey(checkDate))) {
        streakCount += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    } else {
      // Yesterday was missed -> streak has reset/broken
      streakCount = 0;
    }

    return {
      streak: streakCount,
      hasLoggedToday: false,
      statusBadge: '⏳ Pending',
      statusMessage: 'Log a meal today to keep it active!',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      badgeBorder: 'border-amber-200',
      isPending: true,
    };
  }
}

export interface DayStreakStatus {
  dateKey: string;
  dayLabel: string;
  dayNumber: number;
  isToday: boolean;
  logged: boolean;
  mealCount: number;
}

export function getStreakHistory7Days(meals: MealEntry[], now: number = Date.now()): DayStreakStatus[] {
  const days: DayStreakStatus[] = [];
  const today = new Date(now);
  const todayKey = getLocalDateKey(today);

  // Map of dateKey -> meal count
  const dateMealCounts: Record<string, number> = {};
  for (const meal of meals) {
    const time = meal.consumedAt || meal.createdAt;
    if (time) {
      const key = getLocalDateKey(time);
      if (key) {
        dateMealCounts[key] = (dateMealCounts[key] || 0) + 1;
      }
    }
  }

  // Generate 7 days ending with today (Day -6 to Day 0)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = getLocalDateKey(d);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = d.getDate();
    const count = dateMealCounts[dateKey] || 0;

    days.push({
      dateKey,
      dayLabel,
      dayNumber,
      isToday: dateKey === todayKey,
      logged: count > 0,
      mealCount: count,
    });
  }

  return days;
}

export interface StreakMilestone {
  days: number;
  title: string;
  rewardCoins: number;
  badgeEmoji: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, title: 'Starter Spark', rewardCoins: 30, badgeEmoji: '🥉' },
  { days: 7, title: 'Weekly Warrior', rewardCoins: 80, badgeEmoji: '🥈' },
  { days: 14, title: 'Habit Champion', rewardCoins: 150, badgeEmoji: '🥇' },
  { days: 30, title: 'Makan Legend', rewardCoins: 300, badgeEmoji: '👑' },
];

